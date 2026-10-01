import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Req,
  Param,
  Inject,
  UseGuards,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

import { OrdersService } from './orders.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(ordersService) {
    this.ordersService = ordersService;
  }

  @Post()
  async createOrder(body, request) {
    if (request.user.role !== 'buyer') {
      throw new ForbiddenException(
        'Only buyers can place orders',
      );
    }

    return this.ordersService.createOrder(
      request.user.sub,
      body,
    );
  }

  @Get()
  async getMyOrders(request) {
    if (request.user.role !== 'buyer') {
      throw new ForbiddenException(
        'Only buyers can view their orders',
      );
    }

    return this.ordersService.getMyOrders(
      request.user.sub,
    );
  }

  @Get('seller')
  async getSellerOrders(request) {
    if (request.user.role !== 'seller') {
      throw new ForbiddenException(
        'Only sellers can view seller orders',
      );
    }

    return this.ordersService.getSellerOrders(
      request.user.sub,
    );
  }

  @Get('notifications')
  async getSellerNotifications(request) {
    if (request.user.role !== 'seller') {
      throw new ForbiddenException(
        'Only sellers can view notifications',
      );
    }

    return this.ordersService.getSellerNotifications(
      request.user.sub,
    );
  }

  @Patch(':id/status')
  async updateOrderStatus(params, body, request) {
    if (request.user.role !== 'seller') {
      throw new ForbiddenException(
        'Only sellers can update order status',
      );
    }

    const allowedStatuses = [
      'accepted',
      'preparing',
      'ready',
      'completed',
      'cancelled',
    ];

    if (!allowedStatuses.includes(body.status)) {
      throw new BadRequestException(
        'Invalid order status',
      );
    }

    return this.ordersService.updateOrderStatus(
      request.user.sub,
      params.id,
      body.status,
    );
  }

  @Patch(':id/cancel')
  async cancelOrder(params, request) {
    if (request.user.role !== 'buyer') {
      throw new ForbiddenException(
        'Only buyers can cancel orders',
      );
    }

    return this.ordersService.cancelOrder(
      request.user.sub,
      params.id,
    );
  }
}

Inject(OrdersService)(OrdersController, undefined, 0);

Body()(OrdersController.prototype, 'createOrder', 0);
Req()(OrdersController.prototype, 'createOrder', 1);

Req()(OrdersController.prototype, 'getMyOrders', 0);

Req()(OrdersController.prototype, 'getSellerOrders', 0);

Req()(OrdersController.prototype, 'getSellerNotifications', 0);

Param()(OrdersController.prototype, 'updateOrderStatus', 0);
Body()(OrdersController.prototype, 'updateOrderStatus', 1);
Req()(OrdersController.prototype, 'updateOrderStatus', 2);

Param()(OrdersController.prototype, 'cancelOrder', 0);
Req()(OrdersController.prototype, 'cancelOrder', 1);