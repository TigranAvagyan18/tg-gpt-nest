import { createReadStream } from 'fs';
import { Configuration, OpenAIApi } from 'openai';
import config from 'src/config';
import { GptModels } from 'src/entities/user/user.entity';
import { MessageGpt } from '../telegram/telegram.types';

const configuration = new Configuration({
	organization: config.OPENAI_ORGANIZATION,
	apiKey: config.OPENAI_API_KEY
});

export class OpenAI {
	openai = new OpenAIApi(configuration);

	sizes = {
		sm: '256x256',
		md: '512x512',
		lg: '1024x1024'
	};

	async chat(
		messages: Array<MessageGpt>,
		model = GptModels.gpt_3
	): Promise<{ message: MessageGpt; usage: number } | { message: string; usage: number }> {
		let usage = 0;
		try {
			const response = await this.openai.createChatCompletion({ model: GptModels.gpt_3, messages });
			const message = response.data.choices[0].message as MessageGpt;
			console.log(messages.at(-1).content, message);
			usage = messages.at(-1).content.length + message.content.length;
			return { message, usage };
		} catch (error) {
			if (error?.response?.status === 429) {
				const msg = 'Сервера еперегружены, попробуйте позже';
				return { message: msg, usage };
			}
			if (error?.response?.data.error.code === 'context_length_exceeded') {
				const msg = 'История переполнена, очистить историю бота можно через /restart';
				return { message: msg, usage };
			}
			console.log(error?.response?.data);
			return { message: 'Неизвестная ошибка, тех. поддержка @topbestb', usage };
		}
	}

	async speechToText(path: string) {
		try {
			// @ts-ignore
			const response = await this.openai.createTranscription(createReadStream(path), 'whisper-1');
			return response.data.text;
		} catch (error) {
			console.log(error.response.data);
			if (error?.response?.status === 429) {
				return 'Сервера еперегружены, попробуйте позже';
			}
			return 'Unknown error';
		}
	}

	async textToImage(prompt: string, size: string) {
		try {
			const response = await this.openai.createImage({
				prompt,
				n: 1,
				// TODO: Пофиксить типы
				// @ts-ignore
				size: this.sizes[size]
			});
			const { url } = response.data.data[0];
			return url;
		} catch (error) {
			console.log(error.response.data);
		}
	}
}
