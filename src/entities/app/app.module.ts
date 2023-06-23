import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ormconfig } from 'src/config/ormconfig';
import { TelegramModule } from 'src/services/telegram/telegram.module';
import { UserModule } from 'src/entities/user/user.module';
import { SubscriptionModule } from 'src/entities/subscription/subscription.module';
import { CronModule } from 'src/services/cron/cron.module';
import { User } from '../user/user.entity';
import { PaymentModule } from '../payment/payment.module';
import { Subscription } from '../subscription/subscription.entity';
import { Rate } from '../subscription/rate.entity';
import { Booking } from '../subscription/booking.entity';
import { Payment } from '../payment/payment.entity';

@Module({
	imports: [
		TelegramModule,
		UserModule,
		SubscriptionModule,
		PaymentModule,
		CronModule,
		TypeOrmModule.forRoot({
			...ormconfig,
			entities: [User, Subscription, Rate, Booking, Payment]
		}),
		ScheduleModule.forRoot()
	],
	controllers: [],
	providers: []
})
export class AppModule {}
