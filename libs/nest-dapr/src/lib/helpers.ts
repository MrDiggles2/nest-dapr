import { Inject } from '@nestjs/common';

export const getPubSubToken = (name: string) => `dapr-pubsub-${name}`;

export const InjectDaprPubSub = (name: string): ParameterDecorator => Inject(getPubSubToken(name));

export const getSharedConfigToken = () => 'dapr-shared-token';
export const getSharedWrapperToken = () => 'dapr-shared-wrapper';
