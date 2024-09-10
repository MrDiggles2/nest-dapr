import { Module } from '@nestjs/common';
import { DaprModule } from '@libs/nest-dapr';
import { PubsubDemo } from './pubsub-demo';
import { PubsubErrorHandlingDemo } from './pubsub-error-handling-demo';

@Module({
  imports: [
    // Declares that this module should have access to the pubsub named "pubsub"
    DaprModule.registerPubsub({
      pubsubName: 'pubsub',
    }),
  ],
  providers: [PubsubDemo, PubsubErrorHandlingDemo],
})
export class DaprRefModule {}
