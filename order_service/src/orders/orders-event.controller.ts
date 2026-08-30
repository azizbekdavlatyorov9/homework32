import { OrdersService } from "./orders.service";
import { Controller, Logger } from "@nestjs/common";
import {
  Ctx,
  EventPattern,
  Payload,
  RmqContext,
} from "@nestjs/microservices";

export interface OrderDto {
  orderId: number;
  productId: number;
  status: "confirmed" | "rejected";
}

@Controller("orders")
export class OrdersEventController {
  constructor(private readonly ordersService: OrdersService) {}

  private readonly logger = new Logger(OrdersEventController.name);

  @EventPattern("status_update")
  async handleOrderStatus(
    @Payload() orderStatus: OrderDto,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.ordersService.updateStatus(orderStatus);

      this.logger.log(
        `Order #${orderStatus.orderId} statusi: ${orderStatus.status}`,
      );

      // Message muvaffaqiyatli qayta ishlandi
      channel.ack(originalMsg);
    } catch (err: any) {
      this.logger.error(
        `status_update (orderId=${orderStatus?.orderId}) ni qayta ishlashda xato: ${err?.message}`,
        err?.stack,
      );

      // Xatolik bo'lsa message'ni qayta queue'ga yubormaslik
      channel.nack(originalMsg, false, false);
    }
  }
}