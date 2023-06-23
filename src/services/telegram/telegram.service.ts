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
		console.log(id, username);
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
			'Hello',
			Markup.keyboard([
				[translations.menu.language[language], translations.menu.profile[language]],
				[translations.menu.model[language], translations.menu.roles[language]],
				[translations.menu.subscribe[language]]
			])
				.oneTime()
				.resize()
		);
		await this.chooseLanguage(ctx);
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
		const { telegramId, subscriptionId } = ctx.session;

		const user = await this.userService.findByTelegramId(telegramId);

		const subscription = await this.subscriptionService.getSubscriptionDetails(subscriptionId);

		const message = `
    Привет, ${ctx.message.from.first_name}!
Токены: ${user?.availableTokens} / ${subscription?.tokens}
Аудио: ${user?.availableAudio} / ${subscription?.audio}
Картинки: ${user?.availableImages} / ${subscription?.images}
Подписка: ${subscription?.name}
Куплено токенов: ${user.bookedTokens}
Приглашено: ${user.referralCount} пользователей
Ссылка для прилашения: https://t.me/openaichatpro_bot?start=${telegramId}
    `;

		await ctx.reply(message);
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
			translations.chooseRole[lang] + ctx.session.role,
			Markup.inlineKeyboard(
				Object.keys(Roles).map((key: keyof typeof Roles) => Markup.button.callback(Roles[key], key))
			)
		);
	}

	@Hears(SUBSCRIPTION_HEARS)
	@Command(SUBSCRIBE_COMMAND)
	async chooseSubscription(ctx: AppContext) {
		const buttons = (await this.subscriptionService.getAllSubscriptions()).map((rate) => [
			Markup.button.callback(rate.name, `${rate.name}-${rate.id}`)
		]);
		buttons.shift();
		await ctx.reply('Choose ', Markup.inlineKeyboard(buttons));
	}

	@Command(BUT_TOKENS_COMMAND)
	async buyTokens(ctx: AppContext) {
		const amount = +ctx.message.text.split(' ')[1];

		if (!Number.isInteger(amount)) {
			await ctx.reply('Введите число');
			return;
		}

		if (amount < 10000) {
			await ctx.reply('Введите число больше 10к');
			return;
		}

		const { userId } = ctx.session;

		const url = await this.paymentService.create({
			booking: {
				tokens: amount
			},
			userId
		});
		await ctx.reply(url);
	}

	@Command(RESTART_COMMAND)
	async restart(ctx: AppContext) {
		ctx.session.messages = [];
		await ctx.reply('История очищена');
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
		await this.sendMenu(
			ctx,
			`ChatGPT готов к использованию!
	
				⚡️Бот использует модели GPT-3.5, GPT-4
				
				Вот некоторый список того, что умеет данный бот:
				- Писать уникальные тексты
				- Делать рерайт текстов
				- Писать и редактировать код
				- Перевод с любого языка
				- Пересказывать что-либо
				- и многое другое…
				
				Инструкция:
				🔤 Чтобы получить текстовый ответ, напишите свой вопрос на любом языке. Также вы можете просто записать голосовое сообщение с вашим запросом.
				🚀 Чтобы переключиться между моделями GPT-3.5 и GPT-4, используйте команду /choosemodel (обратите внимание, что модель GPT-4 доступна только по подписке).
				✅ Символы необходимы для работы бота и учитываются как в запросе, так и в ответе, а также в истории переписки, поэтому, чтобы потратить меньше символов, используйте команду /deletecontext после окончания диалога.
				👤 Чтобы посмотреть свой баланс, используйте команду /mybalance
				💳 Для покупки и для управления подпиской используйте команду /subscription
				
				Ограничения:
				😀 Каждый пользователь, использующий бесплатный тариф имеет ограничение на количество символов:
				На данный момент у вас доступно 10 000 символов на день, но не больше чем 50 000 символов на месяц.
				Вы можете отправлять запрос с помощью голосовых сообщений, но не больше чем 60 секунд на месяц.
				`,
			language
		);
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
		// @ts-ignore
		const rateId = +ctx.callbackQuery.data.at(-1);
		const messageId = ctx.callbackQuery.message.message_id;

		const { userId } = ctx.session;
		const url = await this.paymentService.create({
			rateId,
			userId
		});
		await ctx.reply(url);
		await ctx.deleteMessage(messageId);
	}

	// !GPT
	@Command(IMAGE_COMMAND)
	async image(ctx: AppContext & Scenes.SceneContext) {
		const userId = ctx.message.from.id;

		const msg = ctx.message.text;
		const newmsg = msg.replace('/image', '');

		const isExpired = await this.userService.checkLimits(userId, 'image');

		if (isExpired) {
			await ctx.reply('Ваш лимит закончился, можете купить подписку');
			return;
		}

		if (newmsg.length < 2) {
			await ctx.reply('Запрос не может быть короче двух символов');
			return;
		}

		await ctx.scene.enter('image', { prompt: msg });
	}

	@On('text')
	async handleText(ctx: AppContext) {
		const userId = ctx.message.from.id;
		const messageCnt = ctx.message.text;
		const isExpired = await this.userService.checkLimits(userId, 'token');

		if (isExpired) {
			await ctx.reply('Ваш лимит закончился, можете купить подписку');
			return;
		}

		if (messageCnt.length < 2) {
			await ctx.reply('Запрос не может быть короче двух символов');
			return;
		}

		if (messageCnt.length > 2000) {
			await ctx.reply('Запрос не может быть больше двух тысяч символов');
			return;
		}

		if (ctx.session.waitingForResponse) {
			await ctx.reply('⏳ Слишком много запросов, подождите. . .');
			return;
		}

		ctx.session.messages.push({ role: 'user', content: `${getRole(ctx.session.role)} ${messageCnt}` });
		try {
			ctx.session.waitingForResponse = true;

			const loading = await ctx.reply('⏳ Пожалуйста, подождите. . .');

			const { message, usage } = await this.openai.chat(ctx.session.messages, ctx.session.model);

			await ctx.deleteMessage(loading.message_id);

			if (typeof message !== 'object') {
				await ctx.reply(message);
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

		const isExpiredAudio = await this.userService.checkLimits(userId, 'audio');
		const isExpiredToken = await this.userService.checkLimits(userId, 'token');

		if (isExpiredAudio || isExpiredToken) {
			await ctx.reply('Ваш лимит закончился, можете купить подписку');
			return;
		}

		if (ctx.session.waitingForResponse) {
			await ctx.reply('⏳ Слишком много запросов, подождите. . .');
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

			const voiceMp3 = await this.audio.create(link.toString(), userId);
			const t = await this.openai.speechToText(voiceMp3);

			if (t.length < 2) {
				await ctx.reply('Запрос не может быть короче двух символов');
				return;
			}

			await ctx.reply(code(t), { reply_to_message_id: ctx.message.message_id });

			await this.userService.updateLimits(userId, { audio: audioDuration }, false);

			ctx.session.waitingForResponse = true;

			ctx.session.messages.push({ role: 'user', content: `${getRole(ctx.session.role)} ${t}` });

			const { message, usage } = await this.openai.chat(ctx.session.messages, ctx.session.model);

			if (typeof message !== 'object') {
				await ctx.reply(message);
				return;
			}

			await this.userService.updateLimits(userId, { tokens: usage }, false);

			ctx.session.messages.push(message);
			await ctx.reply(`${message.content}`);
		} catch (error) {
			await ctx.reply('Что-то пошло не так');
			console.log(error);
		} finally {
			ctx.session.waitingForResponse = false;
		}
	}

	async sendMenu(ctx: AppContext, message: string, language: Languages) {
		await ctx.reply(
			message,
			Markup.keyboard([
				[translations.menu.language[language], translations.menu.profile[language]],
				[translations.menu.model[language], translations.menu.roles[language]],
				[translations.menu.subscribe[language]]
			])
				.oneTime()
				.resize()
		);
	}
}