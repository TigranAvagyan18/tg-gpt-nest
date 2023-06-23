import { Module } from '@nestjs/common';
import { Audio } from './audio.service';

@Module({
	providers: [Audio],
	exports: [Audio]
})
export class AudioModule {}
