import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './utils/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggingInterceptor } from './interception/logging.interceptor';
import { TransformInterceptor } from './interception/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('api'); // set global route
  // config swagger
  const config = new DocumentBuilder()
    .setTitle('API USING NEST JS APP TIVI')
    .setDescription('Author: Nguyen Thien Thanh')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha', // Sắp xếp các tag theo thứ tự từ A-Z
      persistAuthorization: true,
    },
  });
  // middleware

  app.useGlobalInterceptors(new LoggingInterceptor());
  const reflector = app.get(Reflector);

  app.useGlobalInterceptors(new TransformInterceptor(reflector));
  
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
    console.log(`Server is running at http://localhost:${PORT}/api`);
  });
}
bootstrap();
