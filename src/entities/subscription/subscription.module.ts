import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from 'src/entities/payment/payment.entity';
import { User } from 'src/entities/user/user.entity';
import { Subscription } from './subscription.entity';
import { Rate } from './rate.entity';
import { Booking } from './booking.entity';
import { SubscriptionService } from './subscription.service';

@Module({
	imports: [TypeOrmModule.forFeature([Subscription, Rate, Booking, Payment, User])],
	providers: [SubscriptionService],
	exports: [TypeOrmModule, SubscriptionService]
})
export class SubscriptionModule {}
