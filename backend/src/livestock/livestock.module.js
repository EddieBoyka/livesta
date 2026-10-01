import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { Module } from '@nestjs/common';
import { LivestockController } from './livestock.controller.js';
import { LivestockService } from './livestock.service.js';
import { DatabaseModule } from '../database/database.module.js';
import { DatabaseService } from '../database/database.service.js';

@Module({
  imports: [DatabaseModule],
  controllers: [LivestockController],
  providers: [
    {
      provide: LivestockService,
      useFactory: (databaseService) => {
        return new LivestockService(databaseService);
      },
      inject: [DatabaseService],
    },
     JwtAuthGuard,
  ],
})
export class LivestockModule {}