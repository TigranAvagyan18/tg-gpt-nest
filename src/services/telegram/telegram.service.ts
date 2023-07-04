import { UseFilters, Logger } from '@nestjs/common';
import { Action, Command, Hears, InjectBot, On, Start, Update, Use } from 'nestjs-telegraf';
import { Markup, Scenes, Telegraf } from 'telegraf';
import { code } from 'telegraf/format';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from 'src/entities/user/user.service';
import { GptModels, Languages, Roles, User } from 'src/entities/user/user.entity';
import { PaymentService } from 'src/entities/payment/payment.service';
import { SubscriptionService } from 'src/entities/subscription/subscription.service';
import {
	BUT_TOKENS_COMMAND,
	IMAGE_COMMAND,
	IMAGE_HEARS,
	LANGUAGE_ACTION,
	LANGUAGE_COMMAND,
	LANGUAGE_HEARS,
	MODEL_ACTION,
	MODEL_COMMAND,
	MODEL_HEARS,
	PROFILE_COMMAND,
	PROFILE_HEARS,
	RESTART_COMMAND,
	ROLE_ACTION,
	ROLE_COMMAND,
	ROLE_HEARS,
	SUBSCRIBE_COMMAND,
	SUBSCRIPTION_ACTION,
	SUBSCRIPTION_HEARS
} from 'src/config/constants';
import translations from 'src/config/translations';
import { getRole } from 'src/utils/roles';
import config from 'src/config';
import { formatMilliseconds } from 'src/utils/time';
import { OpenAI } from '../openai/openai.service';
import { Audio } from '../audio/audio.service';
import { TelegrafExceptionFilter } from './exception.filter';
import { AppContext } from './telegram.types';

@UseFilters(new TelegrafExceptionFilter())
@Update()
export class Telegram {
	private readonly logger = new Logger(Telegram.name);

	constructor(
		@InjectRepository(User) private readonly user: Repository<User>,
		@InjectBot() private readonly bot: Telegraf<AppContext>,
		private readonly userService: UserService,
		private readonly paymentService: PaymentService,
		private readonly subscriptionService: SubscriptionService,
		private readonly openai: OpenAI,
		private readonly audio: Audio
	) {}

	@Use()
	async use(ctx: AppContext, next: () => void) {
		// @ts-ignore
		if (ctx.message?.text?.includes('/start')) {
			next();
			return;
		}
		const { id, username } = ctx.message?.from || ctx.callbackQuery?.from || {};
		this.logger.log(JSON.stringify({ id, username }));
		if (!ctx.session.userId) {
			let user = await this.userService.findByTelegramId(id);
			if (!user) {
				user = await this.userService.create(id, username);
			}
			ctx.session = {
				messages: [],
				waitingForResponse: false,
				language: user?.language || Languages.RU,
				model: user?.model || GptModels.gpt_3,
				role: user?.role || null,
				telegramId: user.telegramId,
				userId: user.id,
				subscriptionId: user.subscriptionId
			};
		}
		next();
	}

	@Start()
	async start(ctx: AppContext) {
		// @ts-ignore
		const referralId = Number(ctx.message?.text?.split(' ')[1]);
		const user = await this.userService.create(ctx.message.from.id, ctx.message.from.username, referralId);
		const { language } = user;
		ctx.session = {
			messages: [],
			waitingForResponse: false,
			language: user?.language || Languages.RU,
			model: user?.model || GptModels.gpt_3,
			role: user?.role || null,
			telegramId: user.telegramId,
			userId: user.id,
			subscriptionId: user.subscriptionId
		};
		await ctx.reply(
			'Привет',
			Markup.keyboard([
				[translations.menu.language[language || Languages.RU], translations.menu.profile[language || Languages.RU]],
				[translations.menu.model[language || Languages.RU], translations.menu.roles[language || Languages.RU]],
				[translations.menu.subscribe[language || Languages.RU]]
			])
				.oneTime()
				.resize()
		);
		if (language) {
			await this.sendMenu(ctx, language, { tokens: user.availableTokens, audio: user.availableAudio });
		} else {
			await this.chooseLanguage(ctx);
		}
	}

	// !HEARS AND COMMANDS

	@Hears(LANGUAGE_HEARS)
	@Command(LANGUAGE_COMMAND)
	async chooseLanguage(ctx: AppContext) {
		const lang = Languages.RU;
		await ctx.replyWithMarkdownV2(
			translations.chooseLanguage[lang],
			Markup.inlineKeyboard([Markup.button.callback('🇷🇺 Русский', 'ru'), Markup.button.callback('🇺🇸 English', 'en')])
		);
	}

	@Hears(PROFILE_HEARS)
	@Command(PROFILE_COMMAND)
	async showProfile(ctx: AppContext) {
		const { telegramId, subscriptionId, language } = ctx.session;

		const user = await this.userService.findByTelegramId(telegramId);

		const { rate, updatedAt } = await this.subscriptionService.getSubscriptionDetails(subscriptionId);

		const message = `
${translations.profile.limits[language]}
${translations.profile.tokens[language]} ${user?.availableTokens} / ${rate?.tokens}
${translations.profile.audio[language]} ${user?.availableAudio} / ${rate?.audio}
${translations.profile.images[language]} ${user?.availableImages} / ${rate?.images}
${user.bookedTokens > 0 ? translations.profile.bookedTokens[language] : ''}
${translations.profile.subscription[language]} ${rate?.name}

${translations.profile.limitsUpdate.content[language]}
${translations.profile.limitsUpdate.date[language]} ${formatMilliseconds(updatedAt.getTime())}

${translations.profile.referral.title[language]}
${translations.profile.referral.invite[language]}
${translations.profile.referral.invited[language]} ${user.referralCount}
${
	translations.profile.referral.inviteLink[language]
} [https\\:\\/\\/t\\.me\\/openaichatpro\\_bot\\?start\\=${telegramId}](${`https://t.me/openaichatpro_bot?start=${telegramId}`})
    `;

		await ctx.replyWithMarkdownV2(message);
	}

	@Hears(MODEL_HEARS)
	@Command(MODEL_COMMAND)
	async chooseModel(ctx: AppContext) {
		const lang = ctx.session.language;
		const button = [];
		if (ctx.session.model === GptModels.gpt_3) {
			button.push(Markup.button.callback('GPT-4', GptModels.gpt_4));
		} else {
			button.push(Markup.button.callback('GPT-3', GptModels.gpt_3));
		}
		await ctx.reply(translations.currentModel[lang] + ctx.session.model, Markup.inlineKeyboard(button));
	}

	@Hears(ROLE_HEARS)
	@Command(ROLE_COMMAND)
	async chooseRole(ctx: AppContext) {
		const lang = ctx.session.language;
		await ctx.reply(
			translations.chooseRole[lang].replace(':role', ctx.session.role),
			Markup.inlineKeyboard(
				Object.keys(Roles).map((key: keyof typeof Roles) => Markup.button.callback(Roles[key], key))
			)
		);
	}

	@Action(SUBSCRIPTION_HEARS)
	@Hears(SUBSCRIPTION_HEARS)
	@Command(SUBSCRIBE_COMMAND)
	async chooseSubscription(ctx: AppContext) {
		const { language } = ctx.session;
		const buttons = (await this.subscriptionService.getAllSubscriptions()).map((rate) => [
			Markup.button.callback(rate.name, rate.name)
		]);
		buttons.shift();
		buttons.push([Markup.button.callback(translations.subscriptions.buy.content[language], 'buy')]);
		console.log(buttons);
		await ctx.reply(translations.subscriptions.choose[language], Markup.inlineKeyboard(buttons));
	}

	@Command(BUT_TOKENS_COMMAND)
	async buyTokens(ctx: AppContext) {
		const { language, telegramId } = ctx.session;

		const amount = +ctx.message.text.split(' ')[1];

		if (Number.isNaN(amount)) {
			await ctx.replyWithMarkdownV2(translations.subscriptions.buy.queryExample[language]);
			return;
		}

		if (amount < 10000) {
			await ctx.reply('Введите число больше 10к');
			return;
		}

		const price = this.paymentService.getSumOfBooking({ tokens: amount }).toString().replace('.', '\\.');

		const msg = `
${translations.subscriptions.buy.action.result[language].replace(':amount', amount.toString())}
${translations.subscriptions.buy.action.price[language].replace(':price', price)}
		`;

		await ctx.replyWithMarkdownV2(
			msg,
			Markup.inlineKeyboard([
				Markup.button.url(
					translations.subscriptions.pay[language],
					`${config.BACKEND_HOST}/payment/create/${telegramId}?tokens=${amount}`
				)
			])
		);
	}

	@Command(RESTART_COMMAND)
	async restart(ctx: AppContext) {
		ctx.session.messages = [];
		await ctx.reply('Контекст очищен');
	}

	// !ACTIONS

	@Action(LANGUAGE_ACTION)
	async changeLanguage(ctx: AppContext) {
		const { telegramId } = ctx.session;

		// @ts-ignore
		const language = ctx.callbackQuery.data as Languages;

		const user = await this.userService.findByTelegramId(telegramId);

		user.language = language;
		await user.save();

		ctx.session.language = language;

		await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
		await this.sendMenu(ctx, language, { tokens: user.availableTokens, audio: user.availableAudio });
	}

	@Action(ROLE_ACTION)
	async changeRole(ctx: AppContext) {
		const userId = ctx.from?.id;
		// @ts-ignore
		const role = ctx.callbackQuery.data as Roles;
		const { language } = ctx.session;
		// @ts-ignore
		await ctx.editMessageText(translations.roleChanged[language] + Roles[role]);
		// @ts-ignore
		ctx.session.role = Roles[role];
		// @ts-ignore
		await this.user.update({ telegramId: userId }, { role: Roles[role] });
		console.log(ctx.session.role);
	}

	@Action(MODEL_ACTION)
	async changeModel(ctx: AppContext) {
		const { telegramId } = ctx.session;

		// @ts-ignore
		const model = ctx.callbackQuery.data as GptModels;

		const user = await this.userService.findByTelegramId(telegramId);
		user.model = model;
		await user.save();

		const { language } = ctx.session;
		await ctx.editMessageText(translations.modelChanged[language] + model);
		ctx.session.model = model;
	}

	@Action(SUBSCRIPTION_ACTION)
	async generatePaymentUrl(ctx: AppContext) {
		const { language, telegramId } = ctx.session;
		// @ts-ignore
		const rate = ctx.callbackQuery.data as 'Plus';

		await ctx.replyWithMarkdownV2(
			translations.subscriptions[rate][language],
			Markup.inlineKeyboard([
				Markup.button.url(
					translations.subscriptions.pay[language],
					`${config.BACKEND_HOST}/payment/create/${telegramId}?rate=${rate}`
				)
			])
		);
	}

	@Hears(IMAGE_HEARS)
	async showImageMessage(ctx: AppContext) {
		const { language } = ctx.session;
		await ctx.replyWithMarkdownV2(translations.images.create[language]);
	}

	@Action('buy')
	async showBuyMessage(ctx: AppContext) {
		const { language } = ctx.session;
		await ctx.replyWithMarkdownV2(translations.subscriptions.buy.tokens[language]);
	}

	// !GPT
	@Command(IMAGE_COMMAND)
	async image(ctx: AppContext & Scenes.SceneContext) {
		const userId = ctx.message.from.id;
		const { language } = ctx.session;

		const msg = ctx.message.text;
		const newmsg = msg.replace('/image', '');

		const isExpired = await this.userService.checkLimits(userId, 'image');

		if (isExpired) {
			await ctx.reply(translations.errors.limitsExceeded[language]);
			await this.chooseSubscription(ctx);
			return;
		}

		if (newmsg.length < 2) {
			await ctx.reply(translations.errors.lengthLess[language]);
			return;
		}

		await ctx.scene.enter('image', { prompt: msg });
	}

	@On('text')
	async handleText(ctx: AppContext) {
		const userId = ctx.message.from.id;
		const messageCnt = ctx.message.text;
		const { language } = ctx.session;
		const isExpired = await this.userService.checkLimits(userId, 'token');

		if (isExpired) {
			await ctx.reply(translations.errors.limitsExceeded[language]);
			await this.chooseSubscription(ctx);
			return;
		}

		if (messageCnt.length < 2) {
			await ctx.reply(translations.errors.lengthLess[language]);
			return;
		}

		if (messageCnt.length > 2000) {
			await ctx.reply(translations.errors.lengthMore[language]);
			return;
		}

		if (ctx.session.waitingForResponse) {
			await ctx.reply(translations.errors.manyRequests[language]);
			return;
		}

		ctx.session.messages.push({ role: 'user', content: `${getRole(ctx.session.role)} ${messageCnt}` });
		try {
			ctx.session.waitingForResponse = true;

			const loading = await ctx.reply(translations.errors.wait[language]);

			const { message, usage } = await this.openai.chat(ctx.session.messages, ctx.session.model);

			await ctx.deleteMessage(loading.message_id);

			if (typeof message !== 'object') {
				const msg = JSON.parse(message);
				await ctx.reply(msg[language]);
				return;
			}

			await this.userService.updateLimits(userId, { tokens: usage }, false);

			ctx.session.messages.push(message);
			await ctx.reply(`${message.content}`);
		} catch (error) {
			console.log(error);
		} finally {
			ctx.session.waitingForResponse = false;
		}
	}

	@On('voice')
	async handleVoice(ctx: AppContext) {
		const userId = ctx.message.from.id;
		const { language } = ctx.session;

		const isExpiredAudio = await this.userService.checkLimits(userId, 'audio');
		const isExpiredToken = await this.userService.checkLimits(userId, 'token');

		if (isExpiredAudio || isExpiredToken) {
			await ctx.reply(translations.errors.limitsExceeded[language]);
			await this.chooseSubscription(ctx);
			return;
		}

		if (ctx.session.waitingForResponse) {
			await ctx.reply(translations.errors.manyRequests[language]);
			return;
		}

		const user = await this.userService.findByTelegramId(userId);

		try {
			const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
			const audioDuration = ctx.message.voice.duration;

			if (audioDuration > user.availableAudio) {
				await ctx.reply('Длина вашего запроса превышает ваш лимит');
				return;
			}

			const loading = await ctx.reply(translations.errors.wait[language]);

			const voiceMp3 = await this.audio.create(link.toString(), userId);
			const t = await this.openai.speechToText(voiceMp3);

			if (t.length < 2) {
				await ctx.reply(translations.errors.lengthLess[language]);
				return;
			}

			await ctx.reply(code(t), { reply_to_message_id: ctx.message.message_id });

			await this.userService.updateLimits(userId, { audio: audioDuration }, false);

			ctx.session.waitingForResponse = true;

			ctx.session.messages.push({ role: 'user', content: `${getRole(ctx.session.role)} ${t}` });

			const { message, usage } = await this.openai.chat(ctx.session.messages, ctx.session.model);

			await ctx.deleteMessage(loading.message_id);

			if (typeof message !== 'object') {
				const msg = JSON.parse(message);
				await ctx.reply(msg[language]);
				return;
			}

			await this.userService.updateLimits(userId, { tokens: usage }, false);

			ctx.session.messages.push(message);
			await ctx.reply(`${message.content}`);
		} catch (error) {
			await ctx.reply(translations.errors.smth[language]);
			console.log(error);
		} finally {
			ctx.session.waitingForResponse = false;
		}
	}

	async sendMenu(ctx: AppContext, language: Languages, { tokens, audio }: { tokens: number; audio: number }) {
		await ctx.reply(
			translations.welcome[language].replace(':tokens', tokens.toString()).replace(':audio', audio.toString()),
			Markup.keyboard([
				[translations.menu.language[language], translations.menu.profile[language]],
				[translations.menu.model[language], translations.menu.roles[language]],
				[translations.menu.images[language]],
				[translations.menu.subscribe[language]]
			])
				.oneTime()
				.resize()
		);
	}
}
