import {
  DaprServer,
  CommunicationProtocolEnum,
  DaprPubSubStatusEnum,
} from '@dapr/dapr';

const daprHost = '127.0.0.1';
const serverHost = '127.0.0.1';
const serverPort = '6002';
const daprPort = 3500;

start().catch((e) => {
  console.error(e);
  process.exit(1);
});

async function start() {
  const server = new DaprServer({
    serverHost,
    serverPort,
    communicationProtocol: CommunicationProtocolEnum.HTTP,
    clientOptions: {
      daprHost,
      daprPort,
    },
  });

  await server.pubsub.subscribeWithOptions('pubsub', 'dead-letter-topic', {
    callback: async (data) => {
      console.log(`dead-letter-topic: ${JSON.stringify(data)}`);
    },
  });

  await server.pubsub.subscribeWithOptions('pubsub', 'flaky-topic', {
    callback: async (data) => {
      console.log(`flaky-topic: ${JSON.stringify(data)}`);
      return DaprPubSubStatusEnum.RETRY;
    },
    deadLetterTopic: 'dead-letter-topic',
  });

  await server.start();
}
