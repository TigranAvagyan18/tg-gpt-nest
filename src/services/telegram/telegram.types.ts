import { ChatCompletionResponseMessage } from 'openai';
import { Context } from 'telegraf';
// eslint-disable-next-line import/no-unresolved
import { Message, Update } from 'telegraf/typings/core/types/typegram';
import { GptModels, Languages, Roles } from 'src/entities/user/user.entity';

export type MessageGpt = Omit<ChatCompletionResponseMessage, 'content'> & { content: string };

export interface AppContext extends Context {
	session: {
		messages: Array<MessageGpt>;
		waitingForResponse?: boolean | null;
		language?: Languages;
		model: GptModels;
		role: Roles | null;
		userId: number;
		telegramId: number;
		subscriptionId: string;
	};
	message: Update.New & Update.NonChannel & Message.TextMessage & Message.VoiceMessage;
}
