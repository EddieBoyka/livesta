import {
  Injectable,
  Inject,
  CanActivate,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service.js';

@Injectable()
export class JwtAuthGuard {
  constructor(databaseService, jwtService) {
    this.database = databaseService;
    this.jwtService = jwtService;
  }

  async canActivate(context) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authentication token required');
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = await this.jwtService.verifyAsync(token);

      const result = await this.database.pool.query(
        `SELECT id, email, role, is_suspended, is_active
         FROM users
         WHERE id = $1`,
        [payload.sub],
      );

      const user = result.rows[0];

      if (!user || user.is_suspended || !user.is_active) {
        throw new UnauthorizedException(
          'Your account is inactive or suspended',
        );
      }

      request.user = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

Inject(DatabaseService)(JwtAuthGuard, undefined, 0);
Inject(JwtService)(JwtAuthGuard, undefined, 1);