import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './utils/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api'); // set global route
  // config swagger
  const config = new DocumentBuilder()
    .setTitle('API USING NEST JS APP TIVI')
    .setDescription('Author: Nguyen Thien Thanh')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha', // Sắp xếp các tag theo thứ tự từ A-Z
    },
  });
  // middleware
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      disableErrorMessages:true
    }),
  );
   const configService = app.get(ConfigService);
   const PORT = configService.get<number>('PORT') || 3000;
  await app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}
bootstrap();
