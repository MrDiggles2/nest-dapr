import { CommunicationProtocolEnum, DaprClient, DaprClientOptions, DaprServer } from '@dapr/dapr';
import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { randomUUID } from 'crypto';
import { DaprPubsub } from './dapr-pubsub';
import { DaprWrapperService } from './dapr-wrapper.service';
import { DAPR_MODULE_ID } from './dapr.constants';
import { DaprExplorer } from './dapr.explorer';
import { getPubSubToken, getSharedClientToken, getSharedConfigToken, getSharedWrapperToken } from './helpers';

interface DaprModuleConfig {
  server: {
    host: string;
    /**
     * The port Dapr opens for inbound messages
     * i.e. whatever is here --app-port <PORT>
     */
    port: number;
  };
  client: {
    host: string;
    /**
     * The port the Dapr opens for outbound messages
     * i.e. whatever is here --dapr-http-port <PORT>
     */
    port: number;
  };
}

@Global()
@Module({})
export class DaprModule {
  /**
   * Set up a shared connection configuration to the Dapr sidecar. Should be run
   * once at the root module.
   */
  static forRoot(config: DaprModuleConfig): DynamicModule {
    const configProvider: Provider = {
      provide: getSharedConfigToken(),
      useValue: config,
    };

    return {
      module: DaprModule,
      providers: [configProvider],
      exports: [configProvider],
    };
  }

  private static registerCore() {
    const wrapperProvider: Provider<DaprWrapperService> = {
      provide: getSharedWrapperToken(),
      useFactory: async (sharedConfig: DaprModuleConfig) => {
        const clientOptions: Partial<DaprClientOptions> = {
          daprHost: sharedConfig.client.host,
          daprPort: String(sharedConfig.client.port),
          communicationProtocol: CommunicationProtocolEnum.HTTP,
        };

        const server = new DaprServer({
          serverHost: sharedConfig.server.host,
          serverPort: String(sharedConfig.server.port),
          clientOptions,
          communicationProtocol: CommunicationProtocolEnum.HTTP,
        });

        const client = new DaprClient(clientOptions);

        return new DaprWrapperService(server, new DaprClient(clientOptions));
      },
      inject: [getSharedConfigToken()],
    };

    return {
      global: true,
      module: DaprModule,
      imports: [DiscoveryModule],
      providers: [wrapperProvider, DaprExplorer],
      exports: [wrapperProvider],
    };
  }

  /**
   * Registers pubsub providers for the provided named pubsub. Can be run
   * multiple times in a single module for multiple registrations.
   *
   * Builds required Dapr subscriptions at application startup through Dapr explorer
   */
  static registerPubsub(config: { pubsubName: string }): DynamicModule {
    const pubsubProvider: Provider<DaprPubsub> = {
      provide: getPubSubToken(config.pubsubName),
      useFactory: (wrapperService: DaprWrapperService) => {
        return new DaprPubsub(wrapperService.getServer(), wrapperService.getClient(), config.pubsubName);
      },
      inject: [getSharedWrapperToken()],
    };

    return {
      module: DaprModule,
      imports: [DaprModule.registerCore()],
      providers: [pubsubProvider, { provide: DAPR_MODULE_ID, useValue: randomUUID() }],
      exports: [pubsubProvider],
    };
  }

  static registerClient(): DynamicModule {
    const clientProvider: Provider<DaprClient> = {
      provide: getSharedClientToken(),
      useFactory: (wrapperService: DaprWrapperService) => {
        return wrapperService.getClient();
      },
      inject: [getSharedWrapperToken()],
    };

    return {
      module: DaprModule,
      imports: [DaprModule.registerCore()],
      providers: [clientProvider],
      exports: [clientProvider],
    };
  }
}
