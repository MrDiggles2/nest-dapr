import { Injectable, Logger } from '@nestjs/common';
import { DaprPubSubStatusEnum } from '@dapr/dapr';
import {
  DaprPubsub,
  DaprSubscribe,
  DaprSubscriber,
  InjectDaprPubSub,
} from '@libs/nest-dapr';

interface FlakyTopicPayload {
  shouldError: boolean;
}

@Injectable()
// Declares that this class should be able to subscribe to the pubsub named "pubsub" (see dapr/components/redis-pubsub.yaml)
@DaprSubscriber('pubsub')
export class PubsubErrorHandlingDemo {
  private logger = new Logger(PubsubErrorHandlingDemo.name);

  constructor(@InjectDaprPubSub('pubsub') private pubsub: DaprPubsub<string>) {}

  @DaprSubscribe({
    topic: 'flaky-topic',
    options: {
      deadLetterTopic: 'dead-letter-topic',
      failMethod: DaprPubSubStatusEnum.RETRY,
    },
  })
  async handleFlakyTopic(payload: FlakyTopicPayload) {
    this.logger.log(`handleFlakyTopic: ${JSON.stringify(payload)}`);

    if (payload.shouldError) {
      throw new Error('wtf');
    }
  }

  @DaprSubscribe({ topic: 'dead-letter-topic' })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async handleFlakyTopicDlt(payload: any) {
    this.logger.error(`handleFlakyTopicDlt: ${JSON.stringify(payload)}`);
  }
}
