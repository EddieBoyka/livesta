import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService {
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
  }

  async onModuleInit() {
    try {
      await this.pool.query('SELECT 1');

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          full_name VARCHAR(120) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role VARCHAR(20) NOT NULL DEFAULT 'buyer'
            CHECK (role IN ('buyer', 'seller', 'admin')),
          is_verified BOOLEAN NOT NULL DEFAULT FALSE,
          is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await this.pool.query(`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE
      `);

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS livestock (
          id SERIAL PRIMARY KEY,
          seller_id INTEGER NOT NULL REFERENCES users(id)
            ON DELETE CASCADE,
          name VARCHAR(120) NOT NULL,
          category VARCHAR(30) NOT NULL
            CHECK (category IN (
              'goat', 'cattle', 'sheep',
              'pig', 'poultry', 'rabbit'
            )),
          description TEXT,
          price NUMERIC(12, 2) NOT NULL CHECK (price > 0),
          quantity INTEGER NOT NULL DEFAULT 1
            CHECK (quantity >= 0),
          location VARCHAR(120) NOT NULL,
          image_url TEXT,
          is_available BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          buyer_id INTEGER NOT NULL REFERENCES users(id),
          seller_id INTEGER NOT NULL REFERENCES users(id),
          total_amount NUMERIC(12, 2) NOT NULL
            CHECK (total_amount >= 0),
          status VARCHAR(20) NOT NULL DEFAULT 'pending'
            CHECK (status IN (
              'pending', 'accepted', 'preparing',
              'ready', 'completed', 'cancelled'
            )),
          payment_method VARCHAR(30) DEFAULT 'pay_on_delivery',
          payment_status VARCHAR(20) NOT NULL DEFAULT 'pending'
            CHECK (payment_status IN (
              'pending', 'successful', 'failed'
            )),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS order_items (
          id SERIAL PRIMARY KEY,
          order_id INTEGER NOT NULL REFERENCES orders(id)
            ON DELETE CASCADE,
          livestock_id INTEGER NOT NULL REFERENCES livestock(id),
          quantity INTEGER NOT NULL CHECK (quantity > 0),
          unit_price NUMERIC(12, 2) NOT NULL
            CHECK (unit_price > 0)
        )
      `);
            await this.pool.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id)
            ON DELETE CASCADE,
          type VARCHAR(50) NOT NULL,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          is_read BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Password reset tokens
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id)
            ON DELETE CASCADE,
          token_hash TEXT NOT NULL UNIQUE,
          expires_at TIMESTAMPTZ NOT NULL,
          used_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await this.pool.query(`
        CREATE INDEX IF NOT EXISTS
        idx_password_reset_tokens_user_id
        ON password_reset_tokens(user_id)
      `);

      console.log('LIVESTA database connected successfully!');
      console.log('Users table is ready!');
      console.log('Livestock table is ready!');
      console.log('Orders table is ready!');
            console.log('Order items table is ready!');
      console.log('Notifications table is ready!');
      console.log('Admin user controls are ready!');
      console.log('Password reset table is ready!');
    } catch (error) {
      console.error('Database setup failed:', error.message);
      throw error;
    }
  }
}