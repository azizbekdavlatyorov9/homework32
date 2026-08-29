import { Module } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { OrdersController } from "./orders.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "./entities/order.entity";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { OrdersEventController } from "./orders-event.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    ClientsModule.registerAsync([
      {
        name: "PRODUCT_SERVICE",
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get("RABBITMQ_URL")],
            queue: configService.get<string>("RABBITMQ_PRODUCT_QUEUE"),
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
    ]),
  ],
  controllers: [OrdersController, OrdersEventController],
  providers: [OrdersService],
})
export class OrdersModule {}
