import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { DatabaseModule } from '../database/database.module.js';
import { DatabaseService } from '../database/database.service.js';

@Module({
  imports: [DatabaseModule],
  controllers: [OrdersController],
  providers: [
    {
      provide: OrdersService,
      useFactory: (databaseService) => {
        return new OrdersService(databaseService);
      },
      inject: [DatabaseService],
    },
  ],
})
export class OrdersModule {}