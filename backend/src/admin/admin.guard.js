import {
  Injectable,
  ForbiddenException,
} from '@nestjs/common';

export class AdminGuard {
  canActivate(context) {
    const request = context.switchToHttp().getRequest();

    if (request.user?.role !== 'admin') {
      throw new ForbiddenException(
        'Access denied. Admin privileges are required.',
      );
    }

    return true;
  }
}

Injectable()(AdminGuard);