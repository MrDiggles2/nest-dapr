import { DaprClient, DaprServer } from '@dapr/dapr';
import { BeforeApplicationShutdown, OnApplicationBootstrap } from '@nestjs/common';

export class DaprWrapperService implements OnApplicationBootstrap, BeforeApplicationShutdown {
  constructor(
    private server: DaprServer,
    private client: DaprClient,
  ) {}

  getServer(): DaprServer {
    return this.server;
  }

  getClient(): DaprClient {
    return this.client;
  }

  async onApplicationBootstrap() {
    await this.client.start();
    await this.server.start();
  }

  async beforeApplicationShutdown() {
    await this.client.stop();
    await this.server.stop();
  }
}
