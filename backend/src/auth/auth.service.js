import {
  Injectable,
  Inject,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';

import bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service.js';
import { randomBytes, createHash } from 'node:crypto';
import { Resend } from 'resend';

@Injectable()
export class AuthService {
  constructor(databaseService, jwtService) {
    this.database = databaseService;
    this.jwtService = jwtService;
  }

  async ensurePasswordResetTable() {
    await this.database.pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id)
          ON DELETE CASCADE,
        token_hash TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async ensureSellerProfilesTable() {
    await this.database.pool.query(`
      CREATE TABLE IF NOT EXISTS seller_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE
          REFERENCES users(id) ON DELETE CASCADE,
        store_name VARCHAR(150) DEFAULT '',
        phone VARCHAR(30) DEFAULT '',
        location VARCHAR(200) DEFAULT '',
        description TEXT DEFAULT '',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async register({ fullName, email, password, role = 'buyer' }) {
    if (!fullName || !email || !password) {
      throw new BadRequestException(
        'Full name, email, and password are required',
      );
    }

    if (!['buyer', 'seller'].includes(role)) {
      throw new BadRequestException('Invalid account role');
    }

    if (password.length < 8) {
      throw new BadRequestException(
        'Password must be at least 8 characters',
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await this.database.pool.query(
      'SELECT id FROM users WHERE email = $1',
      [normalizedEmail],
    );

    if (existingUser.rows.length > 0) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await this.database.pool.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, role, created_at`,
      [fullName.trim(), normalizedEmail, passwordHash, role],
    );

    return {
      message: 'Account created successfully',
      user: result.rows[0],
    };
  }

  async login({ email, password }) {
    if (!email || !password) {
      throw new BadRequestException(
        'Email and password are required',
      );
    }

    const result = await this.database.pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase().trim()],
    );

    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.is_suspended) {
      throw new UnauthorizedException(
        'Your account has been suspended. Please contact support.',
      );
    }

    if (!user.is_active) {
      throw new UnauthorizedException(
        'Your account is inactive. Please contact support.',
      );
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        isVerified: user.is_verified,
      },
    };
  }

  async forgotPassword({ email }) {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    await this.ensurePasswordResetTable();

    const normalizedEmail = email.toLowerCase().trim();

    const result = await this.database.pool.query(
      'SELECT id FROM users WHERE email = $1',
      [normalizedEmail],
    );

    // Use the same response whether the account exists or not.
    const successMessage =
      'If an account exists for this email, password reset instructions will be sent.';

    if (result.rows.length === 0) {
      return { message: successMessage };
    }

    const userId = result.rows[0].id;

    const token = randomBytes(32).toString('hex');

    const tokenHash = createHash('sha256')
      .update(token)
      .digest('hex');

    await this.database.pool.query(
      `UPDATE password_reset_tokens
       SET used_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND used_at IS NULL`,
      [userId],
    );

    await this.database.pool.query(
      `INSERT INTO password_reset_tokens
       (user_id, token_hash, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '15 minutes')`,
      [userId, tokenHash],
    );

    const frontendUrl =
      process.env.FRONTEND_URL || 'http://localhost:5173';

    const resetUrl = new URL(
      '/reset-password',
      frontendUrl,
    );

    resetUrl.searchParams.set('email', normalizedEmail);
    resetUrl.searchParams.set('token', token);

    // Send the password reset email through Resend.
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [normalizedEmail],
      subject: 'Reset your LIVESTA password',

      text: `You requested a password reset for your LIVESTA account.

Click this link to reset your password:

${resetUrl.toString()}

This link expires in 15 minutes. If you did not request this, you can ignore this email.`,

      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; color: #263b30;">
          <h1 style="color: #174a32;">LIVESTA</h1>

          <h2>Reset your password</h2>

          <p>We received a request to reset your LIVESTA account password.</p>

          <p>Click the button below to choose a new password.</p>

          <p style="margin: 30px 0;">
            <a
              href="${resetUrl.toString()}"
              style="background: #1d7047; color: white; padding: 14px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;"
            >
              Reset Password
            </a>
          </p>

          <p>This link expires in 15 minutes.</p>

          <p>If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    return { message: successMessage };
  }

  async resetPassword({ email, token, newPassword }) {
    if (!email || !token || !newPassword) {
      throw new BadRequestException(
        'Email, reset token, and new password are required',
      );
    }

    if (newPassword.length < 8) {
      throw new BadRequestException(
        'New password must be at least 8 characters',
      );
    }

    await this.ensurePasswordResetTable();

    const normalizedEmail = email.toLowerCase().trim();

    const tokenHash = createHash('sha256')
      .update(token)
      .digest('hex');

    const passwordHash = await bcrypt.hash(newPassword, 10);

    const client = await this.database.pool.connect();

    try {
      await client.query('BEGIN');

      const result = await client.query(
        `SELECT pr.id, pr.user_id
         FROM password_reset_tokens pr
         JOIN users u ON u.id = pr.user_id
         WHERE u.email = $1
           AND pr.token_hash = $2
           AND pr.used_at IS NULL
           AND pr.expires_at > CURRENT_TIMESTAMP
         FOR UPDATE OF pr`,
        [normalizedEmail, tokenHash],
      );

      if (result.rows.length === 0) {
        throw new BadRequestException(
          'Invalid or expired password reset token',
        );
      }

      const resetRecord = result.rows[0];

      await client.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [passwordHash, resetRecord.user_id],
      );

      await client.query(
        `UPDATE password_reset_tokens
         SET used_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [resetRecord.id],
      );

      await client.query('COMMIT');

      return {
        message: 'Password reset successfully. You can now log in.',
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getSellerProfile(user) {
    if (user.role !== 'seller') {
      throw new BadRequestException(
        'Only sellers can access store profiles',
      );
    }

    await this.ensureSellerProfilesTable();

    const result = await this.database.pool.query(
      `SELECT
         u.id AS user_id,
         u.full_name,
         u.email,
         sp.store_name,
         sp.phone,
         sp.location,
         sp.description,
         sp.updated_at
       FROM users u
       LEFT JOIN seller_profiles sp ON sp.user_id = u.id
       WHERE u.id = $1`,
      [user.sub],
    );

    const profile = result.rows[0];

    if (!profile) {
      throw new BadRequestException('Seller account not found');
    }

    return {
      message: 'Store profile retrieved successfully',
      profile: {
        userId: profile.user_id,
        fullName: profile.full_name,
        email: profile.email,
        storeName: profile.store_name || '',
        phone: profile.phone || '',
        location: profile.location || '',
        description: profile.description || '',
        updatedAt: profile.updated_at || null,
      },
    };
  }

  async updateSellerProfile(user, body) {
    if (user.role !== 'seller') {
      throw new BadRequestException(
        'Only sellers can update store profiles',
      );
    }

    const {
      storeName = '',
      phone = '',
      location = '',
      description = '',
    } = body || {};

    if (
      typeof storeName !== 'string' ||
      typeof phone !== 'string' ||
      typeof location !== 'string' ||
      typeof description !== 'string'
    ) {
      throw new BadRequestException(
        'All profile fields must be text',
      );
    }

    if (storeName.length > 150) {
      throw new BadRequestException(
        'Store name cannot exceed 150 characters',
      );
    }

    if (phone.length > 30) {
      throw new BadRequestException(
        'Phone number cannot exceed 30 characters',
      );
    }

    if (location.length > 200) {
      throw new BadRequestException(
        'Location cannot exceed 200 characters',
      );
    }

    await this.ensureSellerProfilesTable();

    const result = await this.database.pool.query(
      `INSERT INTO seller_profiles
         (user_id, store_name, phone, location, description, updated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id)
       DO UPDATE SET
         store_name = EXCLUDED.store_name,
         phone = EXCLUDED.phone,
         location = EXCLUDED.location,
         description = EXCLUDED.description,
         updated_at = CURRENT_TIMESTAMP
       RETURNING
         user_id,
         store_name,
         phone,
         location,
         description,
         updated_at`,
      [
        user.sub,
        storeName.trim(),
        phone.trim(),
        location.trim(),
        description.trim(),
      ],
    );

    const profile = result.rows[0];

    return {
      message: 'Store profile updated successfully',
      profile: {
        userId: profile.user_id,
        storeName: profile.store_name,
        phone: profile.phone,
        location: profile.location,
        description: profile.description,
        updatedAt: profile.updated_at,
      },
    };
  }
}

Inject(DatabaseService)(AuthService, undefined, 0);
Inject(JwtService)(AuthService, undefined, 1);