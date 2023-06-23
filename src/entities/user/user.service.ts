import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectBot } from 'nestjs-telegraf';
import { SubscriptionService } from 'src/entities/subscription/subscription.service';
import { AppContext } from 'src/services/telegram/telegram.types';
import { User } from './user.entity';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User) private readonly userRepository: Repository<User>,
		@InjectBot() private readonly bot: AppContext,
		private readonly subscriptionService: SubscriptionService
	) {}

	async create(telegramId: number, userName: string | undefined, referredBy?: number) {
		const existingUser = await this.findByTelegramId(telegramId);

		if (existingUser) return existingUser;

		const user = this.userRepository.create({ telegramId, userName });
		const subscription = await this.subscriptionService.createSubscription();
		user.subscription = subscription;

		if (referredBy) {
			const referrer = await this.findByTelegramId(referredBy);
			if (referrer) {
				user.referrer = referrer;
				user.availableTokens = 52500;
				referrer.referralCount += 1;
				referrer.availableTokens += 5000;
				await referrer.save();
				await this.bot.telegram.sendMessage(referrer.telegramId, 'Кто то зарегался по вашей ссылке');
			}
		}

		await user.save();
		return user;
	}

	async updateLimits(
		telegramId: number | User,
		limits: { tokens?: number | null; audio?: number | null; images?: number | null; override?: boolean },
		add = true
	) {
		const user = telegramId instanceof User ? telegramId : await this.findByTelegramId(telegramId);

		const isOverride = limits.override;

		if (limits.tokens) {
			const { tokens } = limits;
			if (isOverride) {
				user.availableTokens = tokens;
			} else if (add) {
				user.availableTokens += tokens;
			} else if (user.availableTokens >= tokens) {
				user.availableTokens -= tokens;
			} else if (user.bookedTokens >= tokens - user.availableTokens) {
				user.bookedTokens -= tokens - user.availableTokens;
				user.availableTokens = 0;
			} else {
				user.availableTokens = 0;
				user.bookedTokens = 0;
			}
		}

		if (limits.audio) {
			const audio = isOverride ? limits.audio : limits.audio * (add ? 1 : -1) + user.availableAudio;
			user.availableAudio = audio;
		}

		if (limits.images) {
			const images = isOverride ? limits.images : limits.images * (add ? 1 : -1) + user.availableImages;
			user.availableImages = images;
		}

		await user.save();
	}

	async checkLimits(telegramId: number, type: 'token' | 'audio' | 'image') {
		const user = await this.findByTelegramId(telegramId);

		if (!user) return;

		if (type === 'token') {
			return user.availableTokens <= 0 ? user.bookedTokens <= 0 : false;
		}

		if (type === 'audio') {
			return user.availableAudio <= 0;
		}

		return user.availableImages <= 0 ? user.bookedImages <= 0 : false;
	}

	getReferralTokensCount(referralCount = 0, isReffered: number | null = null) {
		const tokens = referralCount * 5000 + (isReffered ? 2500 : 0);
		return tokens;
	}

	async findByTelegramId(telegramId: number | undefined) {
		const user = await this.userRepository.findOneBy({ telegramId });
		return user;
	}
}
