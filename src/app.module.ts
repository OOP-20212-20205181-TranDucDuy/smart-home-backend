import {  Logger, Module, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailerModule, MailerOptions } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MinioClientModule } from './minio-client/minio-client.module';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { MongooseModule } from '@nestjs/mongoose';
import { RolesGuard } from './auth/guard/role.guard';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { WinstonModule } from 'nest-winston';
// import { winstonConfig } from './constant/winston.config';
import { HomeModule } from './home/home.module';
import { DeviceModule } from './device/device.module';
import { RoomModule } from './room/room.module';
import { NotificationModule } from './notification/notification.module';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        ...configService.get<TypeOrmModuleOptions>('database'),
      }),
      inject: [ConfigService],
      async dataSourceFactory(options) {
        if (!options) {
          throw new Error('Invalid options passed');
        }
        return addTransactionalDataSource(new DataSource(options));
      },
    }),
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        ...configService.get<MailerOptions>('nodemailer'),
      }),
      inject: [ConfigService],
    }),
    CacheModule.register({
      ttl: 5, // seconds
      max: 10, // maximum number of items in cache
      isGlobal : true,
    }),
    MongooseModule.forRootAsync({
      useFactory : () => ({
        uri : `mongodb://root:password123@mongodb-primary:27017/`
      })
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    // WinstonModule.forRoot(winstonConfig),
    JwtModule
    ,UserModule,
    AuthModule,
    MinioClientModule,
    HomeModule,
    DeviceModule,
    RoomModule,
    NotificationModule],
  controllers: [AppController],
  providers: [Logger,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
    {
      provide : APP_GUARD,
      useClass : RolesGuard,
    }
    ,AppService
  ],
})
export class AppModule {}
