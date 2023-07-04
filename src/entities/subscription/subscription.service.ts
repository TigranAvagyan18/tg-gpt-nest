import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './subscription.entity';
import { Rate } from './rate.entity';

@Injectable()
export class SubscriptionService {
	constructor(
		@InjectRepository(Subscription) private readonly subscriptionRepository: Repository<Subscription>,
		@InjectRepository(Rate) private readonly rateRepository: Repository<Rate>
	) {}

	async getFreeSubscription() {
		return (await this.rateRepository.findOneBy({ price: null })) as Rate;
	}

	async getAllSubscriptions() {
		return (await this.rateRepository.find()) as Rate[];
	}

	async getSubscriptionDetails(id: string) {
		const subscription = await this.subscriptionRepository.findOne({ where: { id }, relations: ['rate'] });
		return subscription;
	}

	async createSubscription() {
		const subscription = this.subscriptionRepository.create();
		subscription.rate = await this.getFreeSubscription();
		return subscription;
	}

	async updateSubscription(id: string, rateId: number) {
		const subscription = await this.subscriptionRepository.findOneBy({ id });
		subscription.rateId = rateId;
		await subscription.save();
	}
}
