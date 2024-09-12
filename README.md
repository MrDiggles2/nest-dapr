# Nest+Dapr

A NestJS module for Dapr along with a reference application.

- [Dapr](https://dapr.io/)
- [NestJS](https://nestjs.com/)
- [NX](https://nx.dev/)

See the [module documentation](libs/nest-dapr/README.md) to install just the package.

## Getting started

### Requirements

- MacOS (Windows not supported yet)
- Docker

### Running the project

```
# This will install dependencies and Dapr before running the application
./bin/start.sh
```

## Testing various components

### Pubsub

#### Topic subscription

```
# Mimics a publish to the "pubsub" topic
$> curl -X POST http://localhost:3101/v1.0/publish/pubsub/orders -H "Content-Type: application/json" -d '{"orderId": "100"}'

# You should see some messages in the backend logs like:
== APP == [Nest] 11745  - 09/10/2024, 7:41:17 PM     LOG [PubsubDemo] handleOrdersTopic: {"orderId":"100"}
== APP == [Nest] 11745  - 09/10/2024, 7:41:17 PM     LOG [PubsubDemo] handleOrderCompleteTopic 1725997277402
```

#### Topic subscription with error handling

Currently configured to retry messages 3 times before publishing the message to the deadletter topic "dead-letter-topic"

```
# Handler for this message will throw an error
$> curl -X POST http://localhost:3101/v1.0/publish/pubsub/flaky-topic -H "Content-Type: application/json" -d '{"shouldError": true}'

# You should see some messages in the backend logs like:
== APP == [Nest] 12542  - 09/10/2024, 7:43:01 PM     LOG [PubsubErrorHandlingDemo] handleFlakyTopic: {"shouldError":true}
== APP == [Nest] 12542  - 09/10/2024, 7:43:01 PM   ERROR [DaprPubsub(pubsub)] Handler errored with Error: wtf. Using fail method "RETRY".
== APP == [Nest] 12542  - 09/10/2024, 7:43:04 PM     LOG [PubsubErrorHandlingDemo] handleFlakyTopic: {"shouldError":true}
== APP == [Nest] 12542  - 09/10/2024, 7:43:04 PM   ERROR [DaprPubsub(pubsub)] Handler errored with Error: wtf. Using fail method "RETRY".
== APP == [Nest] 12542  - 09/10/2024, 7:43:07 PM     LOG [PubsubErrorHandlingDemo] handleFlakyTopic: {"shouldError":true}
== APP == [Nest] 12542  - 09/10/2024, 7:43:07 PM   ERROR [DaprPubsub(pubsub)] Handler errored with Error: wtf. Using fail method "RETRY".
== APP == [Nest] 12542  - 09/10/2024, 7:43:10 PM     LOG [PubsubErrorHandlingDemo] handleFlakyTopic: {"shouldError":true}
== APP == [Nest] 12542  - 09/10/2024, 7:43:10 PM   ERROR [DaprPubsub(pubsub)] Handler errored with Error: wtf. Using fail method "RETRY".
== APP == [Nest] 12542  - 09/10/2024, 7:43:11 PM   ERROR [PubsubErrorHandlingDemo] handleFlakyTopicDlt: {"shouldError":true}
```

#### State store

```
# Set the state for entity 1
$> curl -X POST http://localhost:3000/api/client-demo/entity/1 --header "Content-Type: application/json" --data '{"hello": "world"}'

# Fetch the state
$> curl http://localhost:3000/api/client-demo/entity/1
{"hello":"world"}
```

#### Distributed lock

```
# Obtain the lock with ID 1
$> curl -X POST http://localhost:3000/api/client-demo/lock/1/obtain
{"result":"Lock 1 obtained"}

# Attempts to obtain it again will fail
$> curl -X POST http://localhost:3000/api/client-demo/lock/1/obtain
{"result":"Lock 1 not available"}

# Release the lock
$> curl -X POST http://localhost:3000/api/client-demo/lock/1/release
{"result":"Lock 1 released"}

# Attempts to release a non-existing lock will fail
$> curl -X POST http://localhost:3000/api/client-demo/lock/1/release
{"result":"Lock 1 does not exist"}
```

### To release

```
nx release
```
