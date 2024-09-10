import { DaprClient, DaprServer } from '@dapr/dapr';
import { PubSubSubscriptionOptionsType } from '@dapr/dapr/types/pubsub/PubSubSubscriptionOptions.type';

export type DaprSubscribeCallback<T> = (payload: T) => Promise<void>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class DaprPubsub<T extends string | object | undefined = any> {
  constructor(
    public server: DaprServer,
    public client: DaprClient,
    public pubsubName: string,
  ) {}

  /**
   * Subscribe to a topic with options.
   */
  public subscribe = async (
    topic: string,
    callback: DaprSubscribeCallback<T>,
    options: PubSubSubscriptionOptionsType = {},
  ): Promise<void> => {
    await this.server.pubsub.subscribeWithOptions(this.pubsubName, topic, { ...options, callback });
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
