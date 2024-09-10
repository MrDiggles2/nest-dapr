import { DaprServer, CommunicationProtocolEnum } from '@dapr/dapr';

const daprHost = '127.0.0.1';
const serverHost = '127.0.0.1';
const serverPort = '6002';

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
      daprPort: process.env.DAPR_HTTP_PORT,
    },
  });

  //Subscribe to a topic
  await server.pubsub.subscribe('pubsub', 'orders', async (data) => {
    console.log(`Subscriber received: ${JSON.stringify(data)}`);
  });

  await server.start();
}
