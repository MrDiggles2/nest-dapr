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
@DaprSubscriber('pubsub')
export class PubsubErrorHandlingDemo {
  private logger = new Logger(PubsubErrorHandlingDemo.name);

  constructor(@InjectDaprPubSub('pubsub') private pubsub: DaprPubsub<string>) {}

  @DaprSubscribe({
    topic: 'flaky-topic',
    options: {
      // Optional, if not provided, message will be dropped
      deadLetterTopic: 'dead-letter-topic',
      // Instructs Dapr to retry before publishing the message to the dead letter topic
      failMethod: DaprPubSubStatusEnum.RETRY,
    },
  })
  async handleFlakyTopic(payload: FlakyTopicPayload) {
    this.logger.log(`handleFlakyTopic: ${JSON.stringify(payload)}`);

    // If an error is thrown inside this handler, the Dapr will retry delivery
    // using the strategy configured in dapr/components/resiliency.yaml
    if (payload.shouldError) {
      throw new Error('wtf');
    }
  }

  // You can optionally subscribe a handler to the dead letter topic to further
  // process the message. Either way, the message will remain on the topic until
  // someone manually goes and clears it out.
  @DaprSubscribe({ topic: 'dead-letter-topic' })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async handleFlakyTopicDlt(payload: any) {
    this.logger.error(`handleFlakyTopicDlt: ${JSON.stringify(payload)}`);
  }
}
