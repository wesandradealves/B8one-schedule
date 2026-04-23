import { IHashProvider } from '@/domain/interfaces/providers/hash.provider';
import { Module } from '@nestjs/common';
import { HashProvider } from './hash.provider';

@Module({
  providers: [
    {
      provide: IHashProvider,
      useClass: HashProvider,
    },
  ],
  exports: [IHashProvider],
})
export class HashModule {}
