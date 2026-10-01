import {
  Controller,
  Get,
  Patch,
  Delete,
  Inject,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';

import { AdminService } from './admin.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { AdminGuard } from './admin.guard.js';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(adminService) {
    this.adminService = adminService;
  }

  // Dashboard statistics
  @Get('dashboard')
  async getDashboard() {
    return {
      message: 'Admin dashboard retrieved successfully',
      dashboard: await this.adminService.getDashboard(),
    };
  }

  // View all users
  @Get('users')
  async getUsers() {
    return {
      message: 'Users retrieved successfully',
      users: await this.adminService.getUsers(),
    };
  }

  // Verify a seller
  @Patch('sellers/:id/verify')
  async verifySeller(id) {
    return {
      message: 'Seller verified successfully',
      seller: await this.adminService.verifySeller(id),
    };
  }

  // Suspend a user
  @Patch('users/:id/suspend')
  async suspendUser(id) {
    return {
      message: 'User suspended successfully',
      user: await this.adminService.suspendUser(id),
    };
  }

  // Reactivate a user
  @Patch('users/:id/activate')
  async activateUser(id) {
    return {
      message: 'User activated successfully',
      user: await this.adminService.activateUser(id),
    };
  }
  @Patch('orders/:id/status')
async updateOrderStatus(id, body) {
  return {
    message: 'Order status updated successfully',
    order: await this.adminService.updateOrderStatus(id, body.status),
  };
}

  // Remove a livestock listing
  @Delete('livestock/:id')
  async removeListing(id) {
    return {
      message: 'Listing removed successfully',
      livestock: await this.adminService.removeListing(id),
    };
  }

  // View all livestock
  @Get('livestock')
  async getLivestock() {
    return {
      message: 'Livestock retrieved successfully',
      livestock: await this.adminService.getLivestock(),
    };
  }

  // View all orders
  @Get('orders')
  async getOrders() {
    return {
      message: 'Orders retrieved successfully',
      orders: await this.adminService.getOrders(),
    };
  }
}

Inject(AdminService)(AdminController, undefined, 0);

Param('id', ParseIntPipe)(
  AdminController.prototype,
  'verifySeller',
  0,
);

Param('id', ParseIntPipe)(
  AdminController.prototype,
  'suspendUser',
  0,
);

Param('id', ParseIntPipe)(
  AdminController.prototype,
  'activateUser',
  0,
);

Param('id', ParseIntPipe)(
  AdminController.prototype,
  'removeListing',
  0,
);
Param('id', ParseIntPipe)(
  AdminController.prototype,
  'updateOrderStatus',
  0,
);

Body()(
  AdminController.prototype,
  'updateOrderStatus',
  1,
);