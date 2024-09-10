import { Module } from '@nestjs/common';
import { DaprModule } from '@libs/nest-dapr';
import { DaprRefModule } from './app-modules/dapr-ref-module/dapr-ref-module';

@Module({
  imports: [
    DaprModule.forRoot({
      client: {
        host: 'localhost',
        port: Number(process.env.BACKEND_DAPR_HTTP_PORT ?? 3101),
      },
      server: {
        host: 'localhost',
        port: Number(process.env.BACKEND_DAPR_APP_PORT ?? 3102),
      },
    }),
    DaprRefModule,
  ],
})
export class AppModule {}
