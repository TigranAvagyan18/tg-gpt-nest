/* eslint-disable no-shadow */
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
import { Rate } from 'src/entities/subscription/rate.entity';
import { Booking } from 'src/entities/subscription/booking.entity';

export enum Status {
	PENDING,
	COMPLETE,
	DECLINED
}

@Entity('payments')
export class Payment extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ type: 'enum', enum: Status, default: Status.PENDING })
	status: Status;

	@Column()
	slug: string;

	@Column({ type: 'real', default: 0 })
	sum: number;

	@Column({ nullable: true })
	userId: number;

	@Column({ nullable: true })
	rateId: number | null;

	@Column({ nullable: true })
	bookingId: string | null;

	@ManyToOne(() => User, (user) => user.payments)
	user: User;

	@ManyToOne(() => Rate, (rate) => rate.payments)
	rate: Rate;

	@OneToOne(() => Booking, (booking) => booking.payment)
	@JoinColumn()
	booking: Booking;

	@CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)', onUpdate: 'CURRENT_TIMESTAMP(6)' })
	updatedAt: Date;
}
