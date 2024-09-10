import { Injectable, Logger } from '@nestjs/common';
import { DaprPubsub, DaprSubscribe, DaprSubscriber, InjectDaprPubSub } from '@libs/nest-dapr';

@Injectable()
// Declares that this class should be able to subscribe to the pubsub named "pubsub" (see dapr/components/redis-pubsub.yaml)
@DaprSubscriber('pubsub')
export class PubsubDemo {
  private logger = new Logger(PubsubDemo.name);

  constructor(
    /**
     * With this decorator, NestJS will automatically inject the appropriate
     * DaprPubSub object associated with the provided pubsub.
     */
    @InjectDaprPubSub('pubsub') private pubsub: DaprPubsub<string>,
  ) {}

  /**
   * Attaches a subscriber to the topic "orders" on "pubsub"
   *
   * Only one handler is allowed per topic since Dapr wants to centralize error handling. If you need this event to
   * spread out across the backend, you can use https://docs.nestjs.com/techniques/events to dispatch events here and
   * listen elsewhere.
   *
   * You can trigger this manually with
   *    curl -X POST http://localhost:3101/v1.0/publish/pubsub/orders -H "Content-Type: application/json" -d '{"orderId": "100"}'
   */
  @DaprSubscribe({ topic: 'orders' })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async handleOrdersTopic(payload: any) {
    this.logger.log(`handleOrdersTopic: ${JSON.stringify(payload)}`);

    // Add stuff to aidbox

    // Post additional message to pubsub via Dapr
    this.pubsub.publish('order-complete', String(Date.now()));

    // Add things to key-value store/database via Dapr
  }

  @DaprSubscribe({ topic: 'order-complete' })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleOrderCompleteTopic(payload: any) {
    this.logger.log(`handleOrderCompleteTopic ${payload}`);
  }
}
