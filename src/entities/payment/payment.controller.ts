import { Body, Controller, Get, Injectable, Param, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { AppContext } from 'src/services/telegram/telegram.types';
import { PaymentService } from './payment.service';

@Injectable()
@Controller('/payment')
export class PaymentController {
	constructor(
		@InjectBot() private readonly bot: Telegraf<AppContext>,
		private readonly paymentService: PaymentService
	) {}

	@Post('/')
	async confirmPayment(@Body() body: any, @Res() res: Response) {
		console.log(body);
		try {
			await this.paymentService.confirmPayment(body);
			res.status(200).send('ok');
		} catch (error) {
			console.log('Payment', error);
			res.status(500).send();
		}
	}

	@Get('/create/:telegramId')
	// @ts-ignore
	async createPayment(@Param('telegramId') telegramId: string, @Query() query, @Res() res: Response) {
		const { rate, tokens } = query;
		const url = await this.paymentService.create({
			userId: +telegramId,
			rate,
			booking: {
				tokens
			}
		});
		if (url) {
			res.redirect(url);
		} else {
			await this.bot.telegram.sendMessage(telegramId, 'Something went wrong');
			res.status(500).send('error');
		}
	}
}
