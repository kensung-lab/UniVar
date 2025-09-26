import { Module } from '@nestjs/common';
import { UtilsModule } from 'src/utils';
import { FileService } from './services';

@Module({
  imports: [UtilsModule],
  providers: [FileService],
  exports: [FileService],
})
export class ServerModule {}
