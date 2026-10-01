import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { join } from 'node:path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.enableCors({
  origin: allowedOrigins,
});

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  await app.listen(process.env.PORT || 3000);
}

bootstrap();