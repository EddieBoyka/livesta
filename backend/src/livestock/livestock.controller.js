import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Inject,
  Body,
  Req,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
  ForbiddenException,
  ParseIntPipe,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join, extname } from 'node:path';
import { randomUUID } from 'node:crypto';

import { LivestockService } from './livestock.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@Controller('livestock')
export class LivestockController {
  constructor(livestockService) {
    this.livestockService = livestockService;
  }

  // Browse livestock with search and filters
  @Get()
  async findAll(query) {
    const livestock = await this.livestockService.findAll(query);

    return {
      message: 'Livestock retrieved successfully',
      livestock,
    };
  }

  // View a seller's own listings
  @Get('mine')
  @UseGuards(JwtAuthGuard)
  async findMyListings(request) {
    if (request.user.role !== 'seller') {
      throw new ForbiddenException('Only sellers can view their listings');
    }

    const livestock = await this.livestockService.findMyListings(
      request.user.sub,
    );

    return {
      message: 'Your listings retrieved successfully',
      livestock,
    };
  }

  // Add livestock with an image
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (req, file, callback) => {
          callback(
            null,
            `${randomUUID()}${extname(file.originalname)}`,
          );
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          return callback(
            new BadRequestException('Only image files are allowed'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async create(body, file, request) {
    if (request.user.role !== 'seller') {
      throw new ForbiddenException('Only sellers can add livestock');
    }

    if (!file) {
      throw new BadRequestException('Please upload a livestock image');
    }

    const imageUrl = `/uploads/${file.filename}`;

    const livestock = await this.livestockService.create(
      {
        ...body,
        sellerId: request.user.sub,
      },
      imageUrl,
    );

    return {
      message: 'Livestock added successfully',
      livestock,
    };
  }

  // Edit a listing
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(params, body, request) {
    if (request.user.role !== 'seller') {
      throw new ForbiddenException('Only sellers can edit listings');
    }

    const livestock = await this.livestockService.update(
      request.user.sub,
      params.id,
      body,
    );

    return {
      message: 'Livestock updated successfully',
      livestock,
    };
  }

  // Remove a listing
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(params, request) {
    if (request.user.role !== 'seller') {
      throw new ForbiddenException('Only sellers can remove listings');
    }

    const livestock = await this.livestockService.remove(
      request.user.sub,
      params.id,
    );

    return {
      message: 'Livestock listing removed successfully',
      livestock,
    };
  }
}

Inject(LivestockService)(LivestockController, undefined, 0);

Query()(LivestockController.prototype, 'findAll', 0);

Req()(LivestockController.prototype, 'findMyListings', 0);

Body()(LivestockController.prototype, 'create', 0);
UploadedFile()(LivestockController.prototype, 'create', 1);
Req()(LivestockController.prototype, 'create', 2);

Param()(LivestockController.prototype, 'update', 0);
Body()(LivestockController.prototype, 'update', 1);
Req()(LivestockController.prototype, 'update', 2);

Param()(LivestockController.prototype, 'remove', 0);
Req()(LivestockController.prototype, 'remove', 1);