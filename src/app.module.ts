import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { getEnvPath } from './common/helper/env.helper';
import { JSONResponseInterceptor } from './common/interceptors/json-response.interceptor';
import { UsersModule } from './users/users.module';

const envFilePath: string = getEnvPath(`${__dirname}/common/envs`);
@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath, isGlobal: true }),
    MongooseModule.forRoot(process.env.DATABASE_HOST, {
      dbName: process.env.DATABASE_NAME,
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: 'APP_INTERCEPTOR', useClass: JSONResponseInterceptor }, AppService],
})
export class AppModule {}
