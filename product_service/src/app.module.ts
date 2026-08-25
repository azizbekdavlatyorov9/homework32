import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [ConfigModule.forRoot({isGlobal:true}),
    TypeOrmModule.forRootAsync({
      inject:[ConfigService],
      useFactory:(configService: ConfigService) => ({
        type:"postgres",
        host:"localhost",
        port:configService.get<number>("DB_PORT"),
        username:"postgres",
        password: configService.get("DB_PASSWORD"),
        database: configService.get("DB_NAME"),
        autoLoadEntities: true,
        synchronize:true
      })
    }),
    ProductsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
