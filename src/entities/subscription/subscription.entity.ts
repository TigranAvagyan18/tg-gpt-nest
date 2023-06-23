import {
	BaseEntity,
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn
} from 'typeorm';
import { User } from 'src/entities/user/user.entity';
import { Rate } from './rate.entity';

@Entity('subscriptions')
export class Subscription extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ nullable: true })
	rateId: number;

	@OneToOne(() => User, (user) => user.subscription)
	user: User;

	@ManyToOne(() => Rate, (rate) => rate.subscriptions)
	@JoinColumn()
	rate: Rate;

	@CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
	updatedAt: Date;
}
