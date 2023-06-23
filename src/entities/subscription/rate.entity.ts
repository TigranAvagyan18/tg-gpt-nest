import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Payment } from 'src/entities/payment/payment.entity';
import { Subscription } from './subscription.entity';

@Entity('rates')
export class Rate extends BaseEntity {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column()
	name: string;

	@Column()
	tokens: number;

	@Column()
	audio: number;

	@Column({ nullable: true })
	images: number;

	@Column({ type: 'int', nullable: true })
	price: number | null;

	@OneToMany(() => Subscription, (subscription) => subscription.rate)
	subscriptions: Subscription[];

	@OneToMany(() => Payment, (payment) => payment.rate)
	payments: Payment[];
}
