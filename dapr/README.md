## Dapr

[Dapr](https://docs.dapr.io/getting-started/install-dapr-cli/)

## Pubsub

```
# to run a test subscriber
dapr run \
 --app-id checkout \
 --app-port 6002 \
 --dapr-http-port 3500 \
 --placement-host-address localhost:50006 \
 --components-path ./components \
 --config ./config.yaml \
 node test-subscriber.mjs
```

```
# to publish
curl -X POST http://localhost:3500/v1.0/publish/pubsub/orders -H "Content-Type: application/json" -d '{"orderId": "100"}'
```

## State store

```
curl http://localhost:3500/v1.0/state/statestore/name
curl -X POST -H "Content-Type: application/json" -d '[{ "key": "name", "value": "Bruce Wayne"}]' http://localhost:3500/v1.0/state/statestore
```
