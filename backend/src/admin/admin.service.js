import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class AdminService {
  constructor(databaseService) {
    this.databaseService = databaseService;
  }

  // Dashboard statistics
  async getDashboard() {
    const result = await this.databaseService.pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'buyer') AS total_buyers,
        (SELECT COUNT(*) FROM users WHERE role = 'seller') AS total_sellers,
        (SELECT COUNT(*) FROM users
          WHERE role = 'seller' AND is_verified = TRUE
        ) AS verified_sellers,
        (SELECT COUNT(*) FROM livestock) AS total_listings,
        (SELECT COUNT(*) FROM orders) AS total_orders
    `);

    return result.rows[0];
  }

  // View all users
  async getUsers() {
    const result = await this.databaseService.pool.query(`
      SELECT id, full_name, email, role,
             is_verified, is_suspended, is_active, created_at
      FROM users
      ORDER BY created_at DESC
    `);

    return result.rows;
  }

  // Verify a seller
  async verifySeller(id) {
    const result = await this.databaseService.pool.query(
      `UPDATE users
       SET is_verified = TRUE
       WHERE id = $1 AND role = 'seller'
       RETURNING id, full_name, email, is_verified`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Seller not found');
    }

    return result.rows[0];
  }

  // Suspend a user
  async suspendUser(id) {
    const result = await this.databaseService.pool.query(
      `UPDATE users
       SET is_suspended = TRUE
       WHERE id = $1 AND role != 'admin'
       RETURNING id, full_name, email, role, is_suspended`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(
        'User not found or cannot be suspended',
      );
    }

    return result.rows[0];
  }

  // Reactivate a user
  async activateUser(id) {
    const result = await this.databaseService.pool.query(
      `UPDATE users
       SET is_suspended = FALSE, is_active = TRUE
       WHERE id = $1 AND role != 'admin'
       RETURNING id, full_name, email, role, is_suspended, is_active`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException(
        'User not found or cannot be activated',
      );
    }

    return result.rows[0];
  }

  // Remove a livestock listing
  async removeListing(id) {
    const result = await this.databaseService.pool.query(
      `UPDATE livestock
       SET is_available = FALSE, quantity = 0
       WHERE id = $1
       RETURNING id, name, is_available, quantity`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Livestock listing not found');
    }

    return result.rows[0];
  }

  // View all livestock listings
  async getLivestock() {
    const result = await this.databaseService.pool.query(`
      SELECT
        l.*,
        u.full_name AS seller_name,
        u.email AS seller_email
      FROM livestock l
      LEFT JOIN users u ON u.id = l.seller_id
      ORDER BY l.id DESC
    `);

    return result.rows;
  }

  // View all orders
  async getOrders() {
    const result = await this.databaseService.pool.query(`
      SELECT
        o.*,
        buyer.full_name AS buyer_name,
        buyer.email AS buyer_email,
        seller.full_name AS seller_name,
        seller.email AS seller_email,
        COALESCE(
          json_agg(
            json_build_object(
              'livestock_id', oi.livestock_id,
              'name', l.name,
              'quantity', oi.quantity,
              'unit_price', oi.unit_price
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) AS items
      FROM orders o
      LEFT JOIN users buyer ON buyer.id = o.buyer_id
      LEFT JOIN users seller ON seller.id = o.seller_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN livestock l ON l.id = oi.livestock_id
      GROUP BY o.id, buyer.id, seller.id
      ORDER BY o.created_at DESC
    `);

    return result.rows;
  }

  // Update an order's status as an administrator
  async updateOrderStatus(orderId, newStatus) {
    const allowedStatuses = [
      'accepted',
      'preparing',
      'ready',
      'completed',
      'cancelled',
    ];

    if (!allowedStatuses.includes(newStatus)) {
      throw new BadRequestException('Invalid order status');
    }

    const client = await this.databaseService.pool.connect();

    try {
      await client.query('BEGIN');

      const orderResult = await client.query(
        `SELECT id, status
         FROM orders
         WHERE id = $1
         FOR UPDATE`,
        [orderId],
      );

      if (orderResult.rows.length === 0) {
        throw new NotFoundException('Order not found');
      }

      const order = orderResult.rows[0];

      const transitions = {
        pending: ['accepted', 'cancelled'],
        accepted: ['preparing', 'cancelled'],
        preparing: ['ready', 'cancelled'],
        ready: ['completed'],
        completed: [],
        cancelled: [],
      };

      if (!transitions[order.status]?.includes(newStatus)) {
        throw new BadRequestException(
          `Cannot change order from ${order.status} to ${newStatus}`,
        );
      }

      // Restore stock if the order is cancelled
      if (newStatus === 'cancelled') {
        const itemsResult = await client.query(
          `SELECT livestock_id, quantity
           FROM order_items
           WHERE order_id = $1`,
          [orderId],
        );

        for (const item of itemsResult.rows) {
          await client.query(
            `UPDATE livestock
             SET quantity = quantity + $1,
                 is_available = TRUE
             WHERE id = $2`,
            [item.quantity, item.livestock_id],
          );
        }
      }

      const updateResult = await client.query(
        `UPDATE orders
         SET status = $1
         WHERE id = $2
         RETURNING *`,
        [newStatus, orderId],
      );

      await client.query('COMMIT');

      return updateResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}