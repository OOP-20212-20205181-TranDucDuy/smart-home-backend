import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
// import { winstonConfig } from './constant/winston.config';
import * as dotenv from 'dotenv'
import { initializeTransactionalContext } from 'typeorm-transactional';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
async function bootstrap() {
  dotenv.config();
  initializeTransactionalContext();
  const app = await NestFactory.create(AppModule,{
    // logger: WinstonModule.createLogger({
    //   // ...winstonConfig,
    // })
    abortOnError: true,
  });
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.MQTT,
    options : {
      url : 'mqtt://broker.hivemq.com:1883'
    }
  });
  
  await app.startAllMicroservices();
  app.useGlobalPipes(new ValidationPipe());
  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.setGlobalPrefix('api/v2');
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('Smart Home')
    .setDescription('The trainning API description')
    .setVersion('2.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(3003);

}
bootstrap();
