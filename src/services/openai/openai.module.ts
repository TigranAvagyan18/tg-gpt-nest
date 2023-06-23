import { Module } from '@nestjs/common';
import { OpenAI } from './openai.service';

@Module({
	providers: [OpenAI],
	exports: [OpenAI]
})
export class OpenAiModule {}
