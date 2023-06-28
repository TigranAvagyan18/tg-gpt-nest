// @ts-nocheck

import { Action, Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { Markup, Scenes } from 'telegraf';
import { SubscriptionService } from 'src/entities/subscription/subscription.service';
import { UserService } from 'src/entities/user/user.service';
import { OpenAI } from 'src/services/openai/openai.service';
import { AppContext } from '../telegram.types';

@Wizard('image')
export class ImageWizard {
	constructor(
		private readonly subscriptionService: SubscriptionService,
		private readonly userService: UserService,
		private readonly openai: OpenAI
	) {}

	@WizardStep(1)
	async chooseResoltion(@Context() ctx: Scenes.WizardContext) {
		await ctx.reply(
			'Качество изображения',
			Markup.inlineKeyboard([
				[Markup.button.callback('256x256', 'sm')],
				[Markup.button.callback('512x512', 'md')],
				[Markup.button.callback('1024x1024', 'lg')]
			])
		);
	}

	@Action(['sm', 'md', 'lg'])
	async handleResolution(@Context() ctx: AppContext & Scenes.WizardContext) {
		const { id } = await this.subscriptionService.getSubscriptionDetails(ctx.session.subscriptionId);

		const res = ctx.callbackQuery.data as string;

		if (res === 'lg' && id === 1) {
			await ctx.reply('Купите подписку');
			await ctx.scene.leave();
			return;
		}

		console.log(res, id);
		ctx.wizard.state.size = res;
		ctx.wizard.next();
		await ctx.wizard.steps[ctx.wizard.cursor](ctx);
	}

	@WizardStep(2)
	async step2(@Context() ctx: AppContext & Scenes.WizardContext) {
		const { prompt, size } = ctx.wizard.state;
		try {
			const url = await this.openai.textToImage(prompt, size);
			await ctx.replyWithPhoto(url || 'Error');
			await this.userService.updateLimits(ctx.session.telegramId, { images: 1 }, false);
			await ctx.scene.leave();
		} catch (error) {
			console.log(error);
			await ctx.reply('Что-то пошло не так');
		}
	}
}
