import { Injectable, Logger } from '@nestjs/common';
import { DaprPubSubStatusEnum } from '@dapr/dapr';
import {
  DaprSubscribe,
  DaprSubscriber,
} from '@libs/nest-dapr';

interface FlakyTopicPayload {
  shouldError: boolean;
}

@Injectable()
@DaprSubscriber('pubsub')
export class PubsubErrorHandlingDemo {
  private logger = new Logger(PubsubErrorHandlingDemo.name);

  constructor() {}

  /**
   * You can trigger this manually with
   *    curl -X POST http://localhost:3101/v1.0/publish/pubsub/flaky-topic -H "Content-Type: application/json" -d '{"shouldError": true}'
   */
  @DaprSubscribe({
    topic: 'flaky-topic',
    options: {
      // Optional, if not provided, message will be dropped
      deadLetterTopic: 'dead-letter-topic',
      // Instructs Dapr to retry before publishing it to DLT
      failMethod: DaprPubSubStatusEnum.RETRY,
      // Instructs Dapr to not retry and publish it into the DLT if configured
      // failMethod: DaprPubSubStatusEnum.DROP,
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
