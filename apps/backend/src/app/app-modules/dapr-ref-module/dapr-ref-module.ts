import { Module } from '@nestjs/common';
import { DaprModule } from '@libs/nest-dapr';
import { PubsubDemo } from './pubsub-demo';
import { PubsubErrorHandlingDemo } from './pubsub-error-handling-demo';
import { ClientDemoController } from './client-demo.controller';

@Module({
  imports: [
    // Declares that this module should have access to the pubsub named "pubsub"
    DaprModule.registerPubsub({
      pubsubName: 'pubsub',
    }),
    // Declares that this module should have access to the Dapr client
    DaprModule.registerClient()
  ],
  providers: [PubsubDemo, PubsubErrorHandlingDemo],
  controllers: [ClientDemoController]
})
export class DaprRefModule {}
