import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class OrdersService {
  constructor(databaseService) {
    this.databaseService = databaseService;
  }

  async createOrder(buyerId, data) {
    const {
      livestockId,
      quantity,
      paymentMethod = 'pay_on_delivery',
    } = data;

    if (
      !livestockId ||
      !Number.isInteger(Number(quantity)) ||
      Number(quantity) < 1
    ) {
      throw new BadRequestException(
        'Valid livestock ID and quantity are required',
      );
    }

    const allowedPaymentMethods = [
      'pay_on_delivery',
      'bank_transfer',
      'card',
    ];

    if (!allowedPaymentMethods.includes(paymentMethod)) {
      throw new BadRequestException('Invalid payment method');
    }

    const client = await this.databaseService.pool.connect();

    try {
      await client.query('BEGIN');

      const livestockResult = await client.query(
        'SELECT * FROM livestock WHERE id = $1 FOR UPDATE',
        [livestockId],
      );

      const livestock = livestockResult.rows[0];

      if (!livestock || !livestock.is_available) {
        throw new NotFoundException('Livestock is unavailable');
      }

      if (Number(livestock.quantity) < Number(quantity)) {
        throw new BadRequestException(
          'Insufficient livestock quantity',
        );
      }

      if (Number(livestock.seller_id) === Number(buyerId)) {
        throw new BadRequestException(
          'You cannot purchase your own listing',
        );
      }

      const totalAmount =
        Number(livestock.price) * Number(quantity);

      const orderResult = await client.query(
        `INSERT INTO orders
         (buyer_id, seller_id, total_amount, payment_method)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [
          buyerId,
          livestock.seller_id,
          totalAmount,
          paymentMethod,
        ],
      );

      const order = orderResult.rows[0];

      await client.query(
        `INSERT INTO order_items
         (order_id, livestock_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [
          order.id,
          livestock.id,
          quantity,
          livestock.price,
        ],
      );

      const remainingQuantity =
        Number(livestock.quantity) - Number(quantity);

      await client.query(
        `UPDATE livestock
         SET quantity = $1, is_available = $2
         WHERE id = $3`,
        [
          remainingQuantity,
          remainingQuantity > 0,
          livestock.id,
        ],
      );

      // Create notification for the seller
      await client.query(
        `INSERT INTO notifications
         (user_id, type, title, message)
         VALUES ($1, $2, $3, $4)`,
        [
          livestock.seller_id,
          'new_order',
          'New Order Received',
          `A buyer has placed a new order for ${quantity} ${livestock.name}.`,
        ],
      );

      await client.query('COMMIT');

      return {
        message: 'Order placed successfully',
        order,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getMyOrders(buyerId) {
    const result = await this.databaseService.pool.query(
      `SELECT
         o.*,
         COALESCE(
           json_agg(
             json_build_object(
               'livestockId', l.id,
               'name', l.name,
               'category', l.category,
               'quantity', oi.quantity,
               'unitPrice', oi.unit_price
             )
           ) FILTER (WHERE oi.id IS NOT NULL),
           '[]'
         ) AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN livestock l ON l.id = oi.livestock_id
       WHERE o.buyer_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [buyerId],
    );

    return {
      message: 'Your orders retrieved successfully',
      orders: result.rows,
    };
  }

  async getSellerOrders(sellerId) {
    const result = await this.databaseService.pool.query(
      `SELECT
         o.*,
         COALESCE(
           json_agg(
             json_build_object(
               'livestockId', l.id,
               'name', l.name,
               'category', l.category,
               'quantity', oi.quantity,
               'unitPrice', oi.unit_price
             )
           ) FILTER (WHERE oi.id IS NOT NULL),
           '[]'
         ) AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN livestock l ON l.id = oi.livestock_id
       WHERE o.seller_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [sellerId],
    );

    return {
      message: 'Seller orders retrieved successfully',
      orders: result.rows,
    };
  }

  async getSellerNotifications(sellerId) {
    const result = await this.databaseService.pool.query(
      `SELECT
         id,
         type,
         title,
         message,
         is_read,
         created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [sellerId],
    );

    return {
      message: 'Notifications retrieved successfully',
      notifications: result.rows,
    };
  }

  async restoreOrderStock(client, orderId) {
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

  async cancelOrder(buyerId, orderId) {
    const client = await this.databaseService.pool.connect();

    try {
      await client.query('BEGIN');

      const orderResult = await client.query(
        `SELECT *
         FROM orders
         WHERE id = $1 AND buyer_id = $2
         FOR UPDATE`,
        [orderId, buyerId],
      );

      const order = orderResult.rows[0];

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.status !== 'pending') {
        throw new BadRequestException(
          'Only pending orders can be cancelled',
        );
      }

      await this.restoreOrderStock(client, order.id);

      const updateResult = await client.query(
        `UPDATE orders
         SET status = 'cancelled'
         WHERE id = $1
         RETURNING *`,
        [order.id],
      );

      await client.query('COMMIT');

      return {
        message: 'Order cancelled successfully',
        order: updateResult.rows[0],
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateOrderStatus(sellerId, orderId, newStatus) {
    const client = await this.databaseService.pool.connect();

    try {
      await client.query('BEGIN');

      const orderResult = await client.query(
        `SELECT *
         FROM orders
         WHERE id = $1 AND seller_id = $2
         FOR UPDATE`,
        [orderId, sellerId],
      );

      const order = orderResult.rows[0];

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      const allowedTransitions = {
        pending: ['accepted', 'cancelled'],
        accepted: ['preparing', 'cancelled'],
        preparing: ['ready', 'cancelled'],
        ready: ['completed'],
        completed: [],
        cancelled: [],
      };

      if (
        !allowedTransitions[order.status]?.includes(newStatus)
      ) {
        throw new BadRequestException(
          `Cannot change order status from ${order.status} to ${newStatus}`,
        );
      }

      if (newStatus === 'cancelled') {
        await this.restoreOrderStock(client, order.id);
      }

      const result = await client.query(
        `UPDATE orders
         SET status = $1
         WHERE id = $2 AND seller_id = $3
         RETURNING *`,
        [newStatus, orderId, sellerId],
      );

      await client.query('COMMIT');

      return {
        message: 'Order status updated successfully',
        order: result.rows[0],
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}