import {
  Controller,
  Post,
  Body,
  Inject,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

class AuthController {
  register(body) {
    return this.authService.register(body);
  }

  login(body) {
    return this.authService.login(body);
  }

  forgotPassword(body) {
    return this.authService.forgotPassword(body);
  }

  resetPassword(body) {
    return this.authService.resetPassword(body);
  }

  getProfile(request) {
    return this.authService.getSellerProfile(request.user);
  }

  updateProfile(body, request) {
    return this.authService.updateSellerProfile(
      request.user,
      body,
    );
  }
}

Controller('auth')(AuthController);
Inject(AuthService)(AuthController.prototype, 'authService');

Post('register')(
  AuthController.prototype,
  'register',
  Object.getOwnPropertyDescriptor(AuthController.prototype, 'register'),
);
Body()(AuthController.prototype, 'register', 0);

Post('login')(
  AuthController.prototype,
  'login',
  Object.getOwnPropertyDescriptor(AuthController.prototype, 'login'),
);
Body()(AuthController.prototype, 'login', 0);

Post('forgot-password')(
  AuthController.prototype,
  'forgotPassword',
  Object.getOwnPropertyDescriptor(
    AuthController.prototype,
    'forgotPassword',
  ),
);
Body()(AuthController.prototype, 'forgotPassword', 0);

Post('reset-password')(
  AuthController.prototype,
  'resetPassword',
  Object.getOwnPropertyDescriptor(
    AuthController.prototype,
    'resetPassword',
  ),
);
Body()(AuthController.prototype, 'resetPassword', 0);

Get('profile')(
  AuthController.prototype,
  'getProfile',
  Object.getOwnPropertyDescriptor(
    AuthController.prototype,
    'getProfile',
  ),
);
Req()(AuthController.prototype, 'getProfile', 0);
UseGuards(JwtAuthGuard)(
  AuthController.prototype,
  'getProfile',
  Object.getOwnPropertyDescriptor(
    AuthController.prototype,
    'getProfile',
  ),
);

Patch('profile')(
  AuthController.prototype,
  'updateProfile',
  Object.getOwnPropertyDescriptor(
    AuthController.prototype,
    'updateProfile',
  ),
);
Body()(AuthController.prototype, 'updateProfile', 0);
Req()(AuthController.prototype, 'updateProfile', 1);
UseGuards(JwtAuthGuard)(
  AuthController.prototype,
  'updateProfile',
  Object.getOwnPropertyDescriptor(
    AuthController.prototype,
    'updateProfile',
  ),
);

export { AuthController };