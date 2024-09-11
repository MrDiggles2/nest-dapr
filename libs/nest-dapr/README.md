# nest-dapr

## Description

A simple Dapr module for NestJS framework with a focus on pubsub.

## Installation

```bash
$ npm install --save @mrdiggles/nest-dapr
```

## Quick Start

1. Install and set up Dapr as described here: https://docs.dapr.io/getting-started
    * Note: this library uses [programmatic subscriptions](https://docs.dapr.io/developing-applications/building-blocks/pubsub/subscription-methods/#programmatic-subscriptions)
    * You can reference this [sample project](https://github.com/Umbrage-Studios/nestjs-dapr/tree/main/apps/backend)
2. Configure the `DaprModule` in your root module

```ts
@Module({
  imports: [
    DaprModule.forRoot({
      client: {
        host: 'localhost',
        port: 3101, // i.e. --app-port <PORT>
      },
      server: {
        host: 'localhost',
        port: 3102, // i.e. --dapr-http-port <PORT>
      },
    }),
    ...
  ],
})
export class AppModule {}
```

3. Register a Dapr pubsub in an app module

```ts
@Module({
  imports: [
    DaprModule.registerPubsub({
      pubsubName: 'pubsub',
    }),
  ],
  ...
})
export class MyAppModule {}
```

4. Use the `DaprSubscriber` and `DaprSubscribe` in a provider

```ts
@Injectable()
@DaprSubscriber('pubsub')
export class PubsubDemo {

  @DaprSubscribe({ topic: 'orders' })
  async handleOrdersTopic(payload: any) {
    // Do stuff with the topic payload
  }
  ...
}
```

## Reference

### `DaprModule.forRoot`

Dynamic module that sets up the connection between your app and the Dapr sidecar. Should be imported into your root module.

Sample usage:

```ts
@Module({
  imports: [
    DaprModule.forRoot({
      client: {
        host: 'localhost',
        port: 3101, // i.e. --app-port <PORT>
      },
      server: {
        host: 'localhost',
        port: 3102, // i.e. --dapr-http-port <PORT>
      },
    }),
    ...
  ],
})
export class AppModule {}
```

### `DaprModule.registerClient()`

Dynamic module that injects `DaprClient`. Required to use with `InjectDaprClient`.

```ts
@Module({
  imports: [
    DaprModule.registerClient()
  ],
  ...
})
export class MyAppModule {}
```

### `DaprModule.registerPubsub`

Dynamic module that registers an app module to a Dapr pubsub. Required to use the decorators `DaprSubscriber`, `DaprSubscribe`, and `InjectDaprPubSub`

```ts
@Module({
  imports: [
    DaprModule.registerPubsub({
      pubsubName: <PUBSUB NAME>,
    }),
  ],
  ...
})
export class MyAppModule {}
```

### `DaprSubscriber`

Decorator for a provider that declares which pubsub it should be able to connect to.

```ts
@Injectable()
@DaprSubscriber(<NAME OF PUBSUB>)
export class PubsubDemo {
  ...
}
```

### `DaprSubscribe`

Decorator for a handler function that subscribes to a topic.

```ts
  @DaprSubscribe({ topic: 'orders' })
  async handleOrdersTopic(payload: any) {
    // Do something with the payload
  }
```

You can also configure error handling by passing in an options object

```ts
  @DaprSubscribe({
    topic: 'flaky-topic',
    options: {
      // The topic where Dapr should put failed messages
      deadLetterTopic: 'example-dead-letter-topic',
      // Instructs Dapr to retry before publishing it to DLT
      failMethod: DaprPubSubStatusEnum.RETRY,
      // Instructs Dapr to not retry and publish it into DLT
      // failMethod: DaprPubSubStatusEnum.DROP,
    },
  })
  async handleFlakyTopic(payload: FlakyTopicPayload) {
    // Do something with the payload
  }
```

### `InjectDaprClient`

Decorator to inject the raw Dapr client. Requires `DaprModule.registerClient` to have been imported.

```ts
@Injectable()
class MyProvider {

  constructor(@InjectDaprClient() private client: DaprClient) {}

  async someFunction() {
    // Configuration management: https://docs.dapr.io/developing-applications/building-blocks/configuration/
    this.client.configuration

    // Secrets management: https://docs.dapr.io/developing-applications/building-blocks/secrets/
    this.client.secret

    // Pubsub (if you prefer your own implementation): https://docs.dapr.io/developing-applications/building-blocks/pubsub/
    this.client.pubsub
  }

  ...
}
```

### `InjectDaprPubSub`

Decorator to inject the Dapr pubsub client. Requires `DaprModule.registerPubsub` to have been imported.

```ts
@Injectable()
class MyProvider {

  constructor(@InjectDaprPubSub(<PUBSUB NAME>) private pubsub: DaprPubsub<T>) {}

  async someFunction() {
    this.pubsub.publish(<TOPIC NAME>, <PAYLOAD>);
  }

  ...
}
```