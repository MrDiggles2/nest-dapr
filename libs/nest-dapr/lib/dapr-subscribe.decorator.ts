import { SetMetadata } from '@nestjs/common';
import { DaprSubscribeOptions } from './dapr-pubsub';
import { DAPR_MODULE_SUBSCRIBE } from './dapr.constants';

/**
 * Subscribes the attached function as a handler for the given topic.
 *
 * Only one handler is allowed per topic since Dapr wants to centralize error handling.
 */
export function DaprSubscribe(options: {
  topic: string;
  options?: DaprSubscribeOptions;
}): MethodDecorator {
  return SetMetadata(DAPR_MODULE_SUBSCRIBE, options);
}
