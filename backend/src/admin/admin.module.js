import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';
import { AdminGuard } from './admin.guard.js';
import { DatabaseModule } from '../database/database.module.js';
import { DatabaseService } from '../database/database.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Module({
  imports: [DatabaseModule],
  controllers: [AdminController],
  providers: [
    {
      provide: AdminService,
      useFactory: (databaseService) => {
        return new AdminService(databaseService);
      },
      inject: [DatabaseService],
    },
    JwtAuthGuard,
    AdminGuard,
  ],
})
export class AdminModule {}