/* eslint-disable no-use-before-define */
/* eslint-disable no-shadow */
import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn
} from 'typeorm';
import { Payment } from 'src/entities/payment/payment.entity';
import { Subscription } from 'src/entities/subscription/subscription.entity';

export enum Languages {
	EN = 'en',
	RU = 'ru'
}

export enum GptModels {
	gpt_3 = 'gpt-3.5-turbo',
	gpt_4 = 'gpt-4'
}

export enum Roles {
	DEFAULT = 'Обычный',
	GOPNIK = 'Гопник',
	RAPPER = 'Рэпер',
	VILLAGER = 'Деревенщина'
}

@Entity('users')
export class User extends BaseEntity {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column({ type: 'bigint' })
	telegramId: number;

	@Column({ type: 'varchar', nullable: true })
	userName: string;

	@Column({ default: 50000 })
	availableTokens: number;

	@Column({ default: 60 })
	availableAudio: number;

	@Column({ default: 3 })
	availableImages: number;

	@Column({ default: 0 })
	bookedTokens: number;

	@Column({ default: 0 })
	bookedImages: number;

	@Column({ type: 'enum', enum: Languages, default: Languages.EN })
	language: Languages;

	@Column({ type: 'enum', enum: GptModels, default: GptModels.gpt_3 })
	model: GptModels;

	@Column({ type: 'enum', enum: Roles, default: Roles.DEFAULT })
	role: Roles;

	@Column({ nullable: true })
	referrerId: number;

	@Column({ default: 0 })
	referralCount: number;

	@Column({ nullable: true })
	subscriptionId: string;

	@OneToOne(() => Subscription, (subscription) => subscription.user, { cascade: true })
	@JoinColumn()
	subscription: Subscription;

	@OneToMany(() => Payment, (payment) => payment.rate)
	payments: Payment[];

	@ManyToOne(() => User, (user) => user.referrals)
	@JoinColumn({ name: 'referrerId' })
	referrer: User;

	@OneToMany(() => User, (user) => user.referrer)
	referrals: User[];

	@CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
	updatedAt: Date;
}
