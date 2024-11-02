import { NestFactory } from '@nestjs/core';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerCustomOptions,
} from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Subscription tracker API')
    .setDescription(
      'This API aims to expose endpoints to subscription tracker front-end application',
    )
    .setVersion('1.0')
    .addTag('subscription')
    .addBasicAuth()
    .addCookieAuth()
    .build();

  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      withCredentials: true,
    },
  };

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory, customOptions);

  await app.listen(process.env.PORT);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`DATABASE  is loaded : ${process.env.DATABASE_HOST} `);
}
bootstrap();
