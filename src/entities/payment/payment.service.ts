import * as crypto from 'crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectBot } from 'nestjs-telegraf';
import config from 'src/config';
import { User } from 'src/entities/user/user.entity';
import { UserService } from 'src/entities/user/user.service';
import translations from 'src/config/translations';
import { Rate } from '../subscription/rate.entity';
import { SubscriptionService } from '../subscription/subscription.service';
import { Booking, BookingPrices } from '../subscription/booking.entity';
import { AppContext } from '../../services/telegram/telegram.types';
import { Payment, Status } from './payment.entity';
import { PaymentInfo } from './payment.types';

type CreatePayment = {
	rate?: string;
	userId: number;
	booking?: {
		tokens?: number | null;
		images?: number | null;
	};
};

@Injectable()
export class PaymentService {
	paymentUrl: string;

	constructor(
		@InjectRepository(Payment) private readonly paymentRepository: Repository<Payment>,
		@InjectRepository(User) private readonly userRepository: Repository<User>,
		@InjectRepository(Rate) private readonly rateRepository: Repository<Rate>,
		@InjectRepository(Booking) private readonly bookingRepository: Repository<Booking>,
		@InjectBot() private readonly bot: AppContext,
		private readonly userService: UserService,
		private readonly subscriptionService: SubscriptionService
	) {
		this.paymentUrl =
			'https://yoomoney.ru/quickpay/confirm.xml?receiver=4100111040768443&quickpay-form=button&paymentType=AC';
	}

	constructUrl(paymentId: string, sum: number) {
		return `${this.paymentUrl}&sum=${sum}&label=${paymentId}`;
	}

	async create(data: CreatePayment) {
		const { userId, rate, booking } = data;
		const user = await this.userService.findByTelegramId(userId);

		if (!user || (!rate && !booking.tokens)) throw new NotFoundException();

		const existingPayment = await this.paymentRepository.findOneBy({ userId: user?.id });

		if (existingPayment && existingPayment.rateId && existingPayment.status !== Status.COMPLETE) {
			// TODO: Придумать логики для воторой подписки
			await this.cancel(existingPayment);
		}

		const payment = this.paymentRepository.create();
		payment.user = user;

		let price = 0;

		if (rate) {
			const rateToSave = await this.rateRepository.findOneBy({ name: rate });
			payment.rate = rateToSave;
			price = rateToSave.price;
		} else if (booking.tokens) {
			const bookingToCreate = this.bookingRepository.create(booking);
			await bookingToCreate.save();
			payment.booking = bookingToCreate;
			price = this.getSumOfBooking(booking);
		}

		payment.sum = price;

		await payment.save();

		const url = this.constructUrl(payment.id, price);

		return url;
	}

	async cancel(entity: Payment) {
		await this.paymentRepository.remove(entity);
	}

	async confirmPayment(data: PaymentInfo) {
		const isSecure = await this.confirmToken(data.sha1_hash, data);

		if (!isSecure) throw new Error('No payment');

		const paymentId = data.label;

		const payment = await this.paymentRepository.findOne({
			where: { id: paymentId },
			relations: ['rate', 'booking', 'user']
		});

		if (!payment) throw new Error('Not found');

		const { rate, booking, user } = payment;

		payment.status = Status.COMPLETE;

		await payment.save();

		let msg = '';

		if (rate && rate.price === Number(data.withdraw_amount)) {
			await this.userService.updateLimits(user, {
				tokens: rate.tokens,
				audio: rate.audio,
				images: rate.images
			});
			await this.subscriptionService.updateSubscription(user.subscriptionId, rate.id);
			msg = translations.payments.subscriptionSuccess[user.language];
		} else if (booking) {
			const sum = this.getSumOfBooking(booking);
			if (sum === Number(data.withdraw_amount)) {
				user.bookedTokens += booking.tokens || 0;
				await user.save();
				msg = translations.payments.bookingSuccess[user.language];
			}
		}

		await this.bot.telegram.sendMessage(user.telegramId, msg);
	}

	async confirmToken(hash: string, data: PaymentInfo) {
		let str = '';

		str += `${data.notification_type}&`;
		str += `${data.operation_id}&`;
		str += `${data.amount}&`;
		str += `${data.currency}&`;
		str += `${data.datetime}&`;
		str += `${data.sender}&`;
		str += `${data.codepro}&`;
		str += `${config.YOOMONEY_TOKEN}&`;
		str += data.label;
		const result = crypto.createHash('sha1').update(str).digest('hex');
		return result === hash;
	}

	getSumOfBooking(data: Exclude<CreatePayment['booking'], undefined>) {
		const { tokens, images } = data;
		const sum = (tokens || 0) * BookingPrices.token + (images || 0) * BookingPrices.image;
		return +sum.toFixed(2);
	}
}
