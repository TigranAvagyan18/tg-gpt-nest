import { NestFactory } from '@nestjs/core';
import * as ffmpeg from 'fluent-ffmpeg';
import * as installer from '@ffmpeg-installer/ffmpeg';
import { AppModule } from './entities/app/app.module';

async function bootstrap() {
	ffmpeg.setFfmpegPath(installer.path);
	const app = await NestFactory.create(AppModule);
	await app.listen(4001);
}
bootstrap();
