import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from 'src/entities/subscription/booking.entity';
import { Rate } from 'src/entities/subscription/rate.entity';
import { Payment } from 'src/entities/payment/payment.entity';
import { User } from 'src/entities/user/user.entity';
import { UserService } from '../user/user.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { Subscription } from '../subscription/subscription.entity';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';

@Module({
	imports: [TypeOrmModule.forFeature([Payment, User, Booking, Rate, Subscription])],
	controllers: [PaymentController],
	providers: [PaymentService, UserService, SubscriptionService],
	exports: [TypeOrmModule, PaymentService]
})
export class PaymentModule {}
