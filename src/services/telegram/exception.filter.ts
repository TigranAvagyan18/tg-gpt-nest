import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { TelegrafArgumentsHost } from 'nestjs-telegraf';
import { AppContext } from './telegram.types';

@Catch()
export class TelegrafExceptionFilter implements ExceptionFilter {
	async catch(exception: Error, host: ArgumentsHost): Promise<void> {
		const telegrafHost = TelegrafArgumentsHost.create(host);
		const ctx = telegrafHost.getContext<AppContext>();
		if (ctx && (ctx.update || ctx.updateType)) {
			console.log(ctx.from.id);
			console.log(exception);
			await ctx.replyWithHTML(`<b>Error</b>: ${exception.message}`);
		}
	}
}
