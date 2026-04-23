import { ICacheProvider } from '@/domain/interfaces/providers/cache.provider';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-ioredis-yet';
import { RedisCacheProvider } from './redis-cache.provider';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
          password: configService.get<string>('redis.password') || undefined,
          ttl: configService.get<number>('redis.ttlSeconds'),
        }),
      }),
    }),
  ],
  providers: [
    {
      provide: ICacheProvider,
      useClass: RedisCacheProvider,
    },
  ],
  exports: [ICacheProvider, CacheModule],
})
export class RedisCacheModule {}
