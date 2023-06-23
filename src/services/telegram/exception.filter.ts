import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { TelegrafArgumentsHost } from 'nestjs-telegraf';
import { AppContext } from './telegram.types';

@Catch()
export class TelegrafExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(TelegrafExceptionFilter.name);

	async catch(exception: Error, host: ArgumentsHost): Promise<void> {
		const telegrafHost = TelegrafArgumentsHost.create(host);
		const ctx = telegrafHost.getContext<AppContext>();
		if (ctx && (ctx.update || ctx.updateType)) {
			console.log(ctx.from.id);
			this.logger.error(TelegrafExceptionFilter.name, exception);
			await ctx.replyWithHTML(`<b>Error</b>: ${exception.message}`);
		}
	}
}
