import { PubSubSubscriptionOptionsType } from '@dapr/dapr/types/pubsub/PubSubSubscriptionOptions.type';
import { Injectable, Logger, OnModuleInit, Type } from '@nestjs/common';
import { ModuleRef, DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { DaprPubsub } from './dapr-pubsub';
import { DAPR_MODULE_PUBSUB, DAPR_MODULE_SUBSCRIBE } from './dapr.constants';
import { getPubSubToken } from './helpers';

@Injectable()
export class DaprExplorer implements OnModuleInit {
  private readonly logger = new Logger('DaprModule');

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
  ) {}

  onModuleInit() {
    const providers = this.discoveryService.getProviders();

    providers
      .filter((wrapper) => {
        return this.isDaprPubsub(wrapper);
      })
      .forEach(async (wrapper) => {
        const { instance, metatype } = wrapper;
        const { pubsubName } = this.reflector.get(DAPR_MODULE_PUBSUB, instance.constructor || metatype);

        const pubsub = this.getPubsub(getPubSubToken(pubsubName));

        const methods = this.metadataScanner
          .getAllMethodNames(instance)
          .filter((method) => this.isDaprSubscribe(instance[method]));

        for (const method of methods) {
          const { topic, options } = this.reflector.get(DAPR_MODULE_SUBSCRIBE, instance[method]);

          await this.handleSubscriber(pubsub, instance, method, topic, options);
        }
      });
  }

  private isDaprPubsub(wrapper: InstanceWrapper): boolean {
    const target = !wrapper.metatype || wrapper.inject ? wrapper.instance?.constructor : wrapper.metatype;

    if (!target) {
      return false;
    }

    return !!this.reflector.get(DAPR_MODULE_PUBSUB, target);
  }

  private isDaprSubscribe(target: Type): boolean {
    if (!target) {
      return false;
    }

    return !!this.reflector.get(DAPR_MODULE_SUBSCRIBE, target);
  }

  private async handleSubscriber(
    pubsub: DaprPubsub,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    target: any,
    methodName: string,
    topic: string,
    options: PubSubSubscriptionOptionsType,
  ) {
    await pubsub.subscribe(topic, target[methodName].bind(target), options);
  }

  private getPubsub(token: string): DaprPubsub {
    try {
      return this.moduleRef.get<DaprPubsub>(token, { strict: false });
    } catch (err) {
      this.logger.error(`No pubsub found for ${token}`);
      throw err;
    }
  }
}
