import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class LivestockService {
  constructor(databaseService) {
    this.databaseService = databaseService;
  }

  // Get available livestock with seller profiles, search, and filters
  async findAll(filters = {}) {
    const { search, category, location, minPrice, maxPrice } = filters;

    const conditions = ['l.is_available = TRUE'];
    const values = [];

    if (search && search.trim()) {
      values.push(`%${search.trim()}%`);
      conditions.push(
        `(l.name ILIKE $${values.length} OR l.description ILIKE $${values.length})`,
      );
    }

    if (category && category.trim()) {
      const validCategories = [
        'goat',
        'cattle',
        'sheep',
        'pig',
        'poultry',
        'rabbit',
      ];

      const normalizedCategory = category.trim().toLowerCase();

      if (!validCategories.includes(normalizedCategory)) {
        throw new BadRequestException('Invalid livestock category');
      }

      values.push(normalizedCategory);
      conditions.push(`l.category = $${values.length}`);
    }

    if (location && location.trim()) {
      values.push(`%${location.trim()}%`);
      conditions.push(`l.location ILIKE $${values.length}`);
    }

    if (minPrice !== undefined && minPrice !== '') {
      const price = Number(minPrice);

      if (!Number.isFinite(price) || price < 0) {
        throw new BadRequestException('Invalid minimum price');
      }

      values.push(price);
      conditions.push(`l.price >= $${values.length}`);
    }

    if (maxPrice !== undefined && maxPrice !== '') {
      const price = Number(maxPrice);

      if (!Number.isFinite(price) || price < 0) {
        throw new BadRequestException('Invalid maximum price');
      }

      values.push(price);
      conditions.push(`l.price <= $${values.length}`);
    }

    if (
      minPrice !== undefined &&
      minPrice !== '' &&
      maxPrice !== undefined &&
      maxPrice !== '' &&
      Number(minPrice) > Number(maxPrice)
    ) {
      throw new BadRequestException(
        'Minimum price cannot exceed maximum price',
      );
    }

    const result = await this.databaseService.pool.query(
      `SELECT
         l.*,
         sp.store_name AS seller_store_name,
         sp.phone AS seller_phone,
         sp.location AS seller_location,
         sp.description AS seller_description
       FROM livestock l
       LEFT JOIN seller_profiles sp
         ON sp.user_id = l.seller_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY l.created_at DESC`,
      values,
    );

    return result.rows;
  }

  // Get listings belonging to a seller
  async findMyListings(sellerId) {
    const result = await this.databaseService.pool.query(
      `SELECT *
       FROM livestock
       WHERE seller_id = $1
       ORDER BY created_at DESC`,
      [sellerId],
    );

    return result.rows;
  }

  // Add new livestock
  async create(data, imageUrl) {
    const {
      sellerId,
      name,
      category,
      description,
      price,
      quantity,
      location,
    } = data;

    if (!name || !category || !price || !location) {
      throw new BadRequestException(
        'Name, category, price, and location are required',
      );
    }

    const validCategories = [
      'goat',
      'cattle',
      'sheep',
      'pig',
      'poultry',
      'rabbit',
    ];

    if (!validCategories.includes(category.toLowerCase())) {
      throw new BadRequestException('Invalid livestock category');
    }

    if (!Number.isFinite(Number(price)) || Number(price) <= 0) {
      throw new BadRequestException('Price must be greater than zero');
    }

    const stock = quantity === undefined ? 1 : Number(quantity);

    if (!Number.isInteger(stock) || stock < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    const result = await this.databaseService.pool.query(
      `INSERT INTO livestock
       (seller_id, name, category, description, price, quantity, location, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        sellerId,
        name.trim(),
        category.toLowerCase(),
        description || '',
        Number(price),
        stock,
        location.trim(),
        imageUrl,
      ],
    );

    return result.rows[0];
  }

  // Edit an existing listing
  async update(sellerId, livestockId, data) {
    const allowedFields = [
      'name',
      'category',
      'description',
      'price',
      'quantity',
      'location',
    ];

    const updates = [];
    const values = [];
    let index = 1;

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        let value = data[field];

        if (field === 'price') {
          value = Number(value);

          if (!Number.isFinite(value) || value <= 0) {
            throw new BadRequestException(
              'Price must be greater than zero',
            );
          }
        }

        if (field === 'quantity') {
          value = Number(value);

          if (!Number.isInteger(value) || value < 0) {
            throw new BadRequestException(
              'Quantity must be zero or greater',
            );
          }
        }

        if (field === 'category') {
          const validCategories = [
            'goat',
            'cattle',
            'sheep',
            'pig',
            'poultry',
            'rabbit',
          ];

          value = String(value).toLowerCase();

          if (!validCategories.includes(value)) {
            throw new BadRequestException('Invalid livestock category');
          }
        }

        if (field === 'name' || field === 'location') {
          value = String(value).trim();

          if (!value) {
            throw new BadRequestException(
              `${field} cannot be empty`,
            );
          }
        }

        updates.push(`${field} = $${index}`);
        values.push(value);
        index++;
      }
    }

    if (updates.length === 0) {
      throw new BadRequestException(
        'No valid fields provided to update',
      );
    }

    if (data.quantity !== undefined) {
      updates.push(`is_available = $${index}`);
      values.push(Number(data.quantity) > 0);
      index++;
    }

    values.push(livestockId, sellerId);

    const result = await this.databaseService.pool.query(
      `UPDATE livestock
       SET ${updates.join(', ')}
       WHERE id = $${index} AND seller_id = $${index + 1}
       RETURNING *`,
      values,
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Livestock listing not found');
    }

    return result.rows[0];
  }

  // Remove a listing by making it unavailable
  async remove(sellerId, livestockId) {
    const result = await this.databaseService.pool.query(
      `UPDATE livestock
       SET is_available = false, quantity = 0
       WHERE id = $1 AND seller_id = $2
       RETURNING *`,
      [livestockId, sellerId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Livestock listing not found');
    }

    return result.rows[0];
  }
}