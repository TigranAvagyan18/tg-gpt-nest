import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from 'src/entities/payment/payment.entity';
import { Subscription } from 'src/entities/subscription/subscription.entity';
import { SubscriptionService } from '../subscription/subscription.service';
import { Rate } from '../subscription/rate.entity';
import { User } from './user.entity';
import { UserService } from './user.service';

@Module({
	imports: [TypeOrmModule.forFeature([User, Subscription, Payment, Rate])],
	providers: [UserService, SubscriptionService],
	exports: [TypeOrmModule, UserService]
})
export class UserModule {}
