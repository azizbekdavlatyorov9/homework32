import { Controller } from "@nestjs/common";
import { EventPattern } from "@nestjs/microservices";
import { OrderStatus } from "./entities/order.entity";

@Controller('orders')
export class OrdersEventController {
  @EventPattern()
  handleOrderStatus(@Payload() orderStatus)




}