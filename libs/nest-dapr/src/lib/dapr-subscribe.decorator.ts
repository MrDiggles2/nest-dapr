import { PubSubSubscriptionOptionsType } from '@dapr/dapr/types/pubsub/PubSubSubscriptionOptions.type';
import { SetMetadata } from '@nestjs/common';
import { DAPR_MODULE_SUBSCRIBE } from './dapr.constants';

/**
 * Subscribes the attached function as a handler for the given topic.
 *
 * Only one handler is allowed per topic since Dapr wants to centralize error handling.
 */
export function DaprSubscribe(options: { topic: string; options?: PubSubSubscriptionOptionsType }): MethodDecorator {
  return SetMetadata(DAPR_MODULE_SUBSCRIBE, options);
}
