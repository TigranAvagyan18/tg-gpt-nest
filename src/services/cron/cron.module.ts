import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { UserModule } from 'src/entities/user/user.module';
import { SubscriptionModule } from 'src/entities/subscription/subscription.module';
import { CronService } from './cron.service';

@Module({
	imports: [ScheduleModule.forRoot(), UserModule, SubscriptionModule],
	providers: [CronService]
})
export class CronModule {}
