import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';
import config from 'src/config';
import { UserModule } from 'src/entities/user/user.module';
import { PaymentModule } from 'src/entities/payment/payment.module';
import { SubscriptionModule } from 'src/entities/subscription/subscription.module';
import { AudioModule } from '../audio/audio.module';
import { OpenAiModule } from '../openai/openai.module';
import { Telegram } from './telegram.service';
import { ImageWizard } from './scenes/image.scene';

@Module({
	imports: [
		TelegrafModule.forRoot({
			token: config.TELEGRAM_TOKEN,
			middlewares: [session()]
		}),
		AudioModule,
		OpenAiModule,
		UserModule,
		PaymentModule,
		SubscriptionModule
	],
	providers: [Telegram, ImageWizard]
})
export class TelegramModule {}
