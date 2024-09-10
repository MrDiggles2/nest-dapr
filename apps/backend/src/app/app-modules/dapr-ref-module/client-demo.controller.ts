import { DaprClient } from "@dapr/dapr";
import { LockStatus } from "@dapr/dapr/types/lock/UnlockResponse";
import { InjectDaprClient } from "@libs/nest-dapr";
import { Body, Controller, Get, Injectable, Param, Post } from "@nestjs/common";

@Injectable()
@Controller('client-demo')
export class ClientDemoController {
  // i.e. the name of the state component as configured in dapr/components/statestore.yaml
  private stateStoreName = 'statestore'
  // i.e. the name of the lock component as configured in dapr/components/lock.yaml
  private lockStoreName = 'lockstore'

  constructor(@InjectDaprClient() private client: DaprClient) {}

  // State: https://docs.dapr.io/developing-applications/building-blocks/state-management/

  // Use `curl http://localhost:3000/api/client-demo/entity/1`
  @Get('/entity/:id')
  getEntity(@Param('id') id: string) {
    return this.client.state.get(this.stateStoreName, `entity:${id}`);
  }

  // Use `curl -X POST http://localhost:3000/api/client-demo/entity/1 --header "Content-Type: application/json" --data '{"hello": "world"}'`
  @Post('/entity/:id')
  async updateEntity(@Param('id') id: string, @Body() body: any) {
    await this.client.state.save(this.stateStoreName, [{ key: `entity:${id}`, value: body }])
  }

  // Distributed Lock: https://docs.dapr.io/developing-applications/building-blocks/distributed-lock/

  // curl -X POST http://localhost:3000/api/client-demo/lock/1/obtain
  @Post('/lock/:id/obtain')
  async obtainLock(@Param('id') id: string, @Body() body: any) {
    const result = await this.client.lock.lock(this.lockStoreName, `lock:${id}`, 'lock-owner', 60)
    if (!result.success) {
      return { 'result': `Lock ${id} not available` };
    }
    return { 'result': `Lock ${id} obtained` };
  }

  // curl -X POST http://localhost:3000/api/client-demo/lock/1/release
  @Post('/lock/:id/release')
  async releaseLock(@Param('id') id: string, @Body() body: any) {
    const result = await this.client.lock.unlock(this.lockStoreName, `lock:${id}`, 'lock-owner')
    switch (result.status) {
      case (LockStatus.Success):
        return { 'result': `Lock ${id} released` };
      case (LockStatus.LockDoesNotExist):
        return { 'result': `Lock ${id} does not exist` };
      case (LockStatus.LockBelongsToOthers):
        return { 'result': `Lock ${id} belongs to other` };
      case (LockStatus.InternalError):
        return { 'result': `Lock ${id} unexpected error` };
    }
  }

  async other() {
    // Other functionality is exposed via this.client

    // Configuration management: https://docs.dapr.io/developing-applications/building-blocks/configuration/
    this.client.configuration

    // Secrets management: https://docs.dapr.io/developing-applications/building-blocks/secrets/
    this.client.secret

    // Pubsub (if you prefer your own implementation): https://docs.dapr.io/developing-applications/building-blocks/pubsub/
    this.client.pubsub

    // And more! https://docs.dapr.io/developing-applications/building-blocks/
  }
}
