import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Subscription tracker API')
    .setDescription(
      'This API aims to expose endpoints to subscription tracker front-end application',
    )
    .setVersion('1.0')
    .addTag('subscription')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`DATABASE  is loaded : ${process.env.DATABASE_HOST} `);
}
bootstrap();
