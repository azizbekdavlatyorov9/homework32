import { ConfigModule, ConfigService } from "@nestjs/config";
import { Module } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { ProductsController } from "./products.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./entities/product.entity";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ProductsEventController } from "./product-event.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    ClientsModule.registerAsync([
      {
        name: "ORDER_SERVICE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get("RABBITMQ_URL")],
            queue: configService.get<string>("RABBITMQ_ORDER_QUEUE"),
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
    ]),
  ],
  controllers: [ProductsController, ProductsEventController],
  providers: [ProductsService],
})
export class ProductsModule {}
