import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { join } from 'node:path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
  origin: 'http://localhost:5173',
});

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  await app.listen(process.env.PORT || 3000);
}

bootstrap();