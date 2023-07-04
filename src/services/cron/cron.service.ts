import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectBot } from 'nestjs-telegraf';
import { Markup, Telegraf } from 'telegraf';
import { User } from 'src/entities/user/user.entity';
import { UserService } from 'src/entities/user/user.service';
import { SubscriptionService } from 'src/entities/subscription/subscription.service';
import config from 'src/config';
import translations from 'src/config/translations';
import { AppContext } from '../telegram/telegram.types';

@Injectable()
export class CronService {
	private readonly logger = new Logger(CronService.name);

	constructor(
		@InjectRepository(User) private readonly userRepository: Repository<User>,
		@InjectBot() private readonly bot: Telegraf<AppContext>,
		private readonly userService: UserService,
		private readonly subscriptionService: SubscriptionService
	) {}

	@Cron(CronExpression.EVERY_HOUR, {
		disabled: config.APP_ENV !== 'dev'
	})
	async updateSubscriptions() {
		this.logger.log('Cron updateSubscriptions Working');

		const users = await this.userRepository.find({ relations: ['subscription'] });
		const usersToUpdate = await Promise.all(
			users.map(async (user) => {
				const currentDate = new Date();
				const date = new Date(user.subscription.updatedAt);
				const timeDiff = currentDate.getTime() - date.getTime();
				const millisInMonth = 30 * 24 * 60 * 60 * 1000;
				const isOneMonthAgo = timeDiff >= millisInMonth;
				if (isOneMonthAgo) {
					const { rateId } = user.subscription;
					user.subscription.rateId = 1;
					const rate = await this.subscriptionService.getFreeSubscription();
					await this.userService.updateLimits(user, {
						tokens: rate.tokens + this.userService.getReferralTokensCount(user.referralCount, user.referrerId),
						audio: rate.audio,
						images: rate.images,
						override: true
					});
					const msg = {
						content: translations.payments.content[user.language],
						button: translations.payments.button[user.language]
					} as {
						title: string;
						content: string;
						button: string;
					};
					if (rateId !== 1) {
						msg.title = translations.payments.expired[user.language];
					} else {
						msg.title = translations.payments.updated[user.language];
					}
					await this.bot.telegram.sendMessage(user.telegramId, `${msg.title}\n${msg.content}`, {
						reply_markup: {
							inline_keyboard: [[Markup.button.callback(msg.button, translations.menu.subscribe[user.language])]]
						}
					});
				}

				return user;
			})
		);

		await this.userRepository.save(usersToUpdate);

		this.logger.log('Cron updateSubscriptions finish');
	}

	@Cron(CronExpression.EVERY_6_HOURS)
	async updateUserNames() {
		this.logger.log('Cron updateUserNames Working');

		const users = await this.userRepository.find({});
		const updatedUsers = await Promise.all(
			users.map(async (user) => {
				const tgUser = await this.bot.telegram.getChat(user.telegramId);
				// @ts-ignore
				user.userName = tgUser.username;
				return user;
			})
		);
		await this.userRepository.save(updatedUsers);
		this.logger.log('Cron updateUserNames finish');
	}
}
