import { Controller, Inject, Logger } from "@nestjs/common";
import {
  ClientProxy,
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from "@nestjs/microservices";
import { ProductsService } from "./products.service";

export interface OrderDto {
  orderId: number;
  productId: number;
  quantity: number;
}

@Controller("products")
export class ProductsEventController {
  constructor(
    private productService: ProductsService,
    @Inject("ORDER_SERVICE") private clientService: ClientProxy,
  ) {}
  private readonly Logger = new Logger(ProductsEventController.name);
  @EventPattern("created_order")
  async handleOrder(
    @Payload() orderData: OrderDto,
    @Ctx() context: RmqContext,
  ) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      if (!orderData) {
        this.Logger.warn("Order data not found");
        channel.ack(originalMsg);
        return;
      }

      const access = await this.productService.decrasingQuantity(
        orderData.productId,
        orderData.quantity,
      );

      const result = {
        orderId: orderData.orderId,
        productId: orderData.productId,
        status: access ? "confirmed" : "rejected",
      };

      this.clientService.emit("status_update", result);
      new this.Logger.log(
        `"order result: " + ${access ? "confirmed" : "rejected"}`,
      );
      channel.ack(originalMsg);
    } catch (err: any) {
      this.Logger.error(
        `created_order (orderId=${orderData?.orderId}) ni qayta ishlashda xato: ${err?.message}`,
        err?.stack,
      );
      channel.nack(originalMsg, false, false);
    }
  }

  @MessagePattern("check_status")
  async handleRequest(@Payload() dto: any) {
    const result = await this.productService.checkStatus(dto);

    return result;
  }
}
