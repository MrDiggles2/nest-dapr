import { SetMetadata } from '@nestjs/common';
import { DAPR_MODULE_PUBSUB } from './dapr.constants';

/**
 * Declares that the decorated class should be able to subscribe to the pubsub
 * that matches the provided name
 */
export function DaprSubscriber(pubsubName: string): ClassDecorator {
  return SetMetadata(DAPR_MODULE_PUBSUB, { pubsubName });
}
