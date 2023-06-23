import { Body, Controller, Get, Injectable, NotFoundException, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { PaymentService } from './payment.service';

@Injectable()
@Controller('/payment')
export class PaymentController {
	constructor(private readonly paymentService: PaymentService) {}

	@Get('/:slug')
	async getPayment(@Param('slug') slug: string, @Res() res: Response) {
		const url = await this.paymentService.getPaymentUrlBySlug(slug);
		if (url) {
			res.redirect(url);
			return;
		}
		throw new NotFoundException();
	}

	@Post('/')
	async confirmPayment(@Body() body: any, @Res() res: Response) {
		try {
			await this.paymentService.confirmPayment(body);
			return 'ok';
		} catch (error) {
			res.status(500).send();
		}
	}
}
