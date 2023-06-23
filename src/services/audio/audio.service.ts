import { resolve } from 'path';
import { createWriteStream } from 'fs';
import { unlink } from 'fs/promises';
import axios from 'axios';
import * as ffmpeg from 'fluent-ffmpeg';

export class Audio {
	async mp3(input: string, output: string): Promise<string> {
		return new Promise((_resolve, reject) => {
			ffmpeg(input)
				.inputOption('-t 30')
				.output(output)
				.on('end', () => _resolve(output))
				.on('error', (e) => reject(e))
				.run();
		});
	}

	async create(url: string, userId: number): Promise<string> {
		try {
			const path = resolve(`${process.cwd()}/src/uploads`, `${userId}-${new Date().getTime()}.ogg`);
			const resp = await axios.get(url, { responseType: 'stream' });
			return new Promise((_resolve) => {
				const stream = createWriteStream(path);
				resp.data.pipe(stream);
				stream.on('finish', async () => {
					const mp3 = await this.mp3(path, path.replace('.ogg', '.mp3'));
					await unlink(path);
					_resolve(mp3);
					return mp3;
				});
			});
		} catch (error) {
			console.log(error);
			return 'Error';
		}
	}
}
