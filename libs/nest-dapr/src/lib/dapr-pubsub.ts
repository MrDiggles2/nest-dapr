import { DaprClient, DaprServer, DaprPubSubStatusEnum } from '@dapr/dapr';
import { Logger } from '@nestjs/common';

export type DaprSubscribeCallback<T> = (payload: T) => Promise<void>;

export type DaprSubscribeOptions = {
  /**
   * Specify how to continue if the handler fails:
   *
   * * DaprPubSubStatusEnum.DROP: Don't retry and move message to dead letter topic if configured
   * * DaprPubSubStatusEnum.RETRY: Retry on failure. If retries are exhausted, move message to dead letter topic if configured
   */
  failMethod?: DaprPubSubStatusEnum;
  deadLetterTopic?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class DaprPubsub<T extends string | object | undefined = any> {
  private logger: Logger;

  constructor(
    public server: DaprServer,
    public client: DaprClient,
    public pubsubName: string
  ) {
    this.logger = new Logger(`${DaprPubsub.name}(${pubsubName})`);
  }

  /**
   * Subscribe to a topic with options.
   */
  public subscribe = async (
    topic: string,
    callback: DaprSubscribeCallback<T>,
    options?: DaprSubscribeOptions
  ): Promise<void> => {
    const { deadLetterTopic, failMethod = DaprPubSubStatusEnum.SUCCESS } =
      options ?? {};

    await this.server.pubsub.subscribeWithOptions(this.pubsubName, topic, {
      deadLetterTopic,
      callback: async (payload) => {
        try {
          await callback(payload);
          return DaprPubSubStatusEnum.SUCCESS;
        } catch (error) {
          this.logger.error(
            `Handler errored with ${error}. Using fail method "${failMethod}".`
          );
          return failMethod;
        }
      },
    });
  };

  /**
   * Publish data to a topic.
   * If the data is a valid cloud event, it will be published with Content-Type: application/cloudevents+json.
   * Otherwise, if it's a JSON object, it will be published with Content-Type: application/json.
   * Otherwise, it will be published with Content-Type: text/plain.
   */
  public async publish(topic: string, payload: T) {
    return await this.client.pubsub.publish(this.pubsubName, topic, payload);
  }
}
