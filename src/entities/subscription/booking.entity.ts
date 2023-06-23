import { BaseEntity, Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Payment } from 'src/entities/payment/payment.entity';

export const BookingPrices = {
	token: 0.5 / 1000,
	image: 4
};

@Entity('bookings')
export class Booking extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ type: 'int', nullable: true })
	tokens: number | null;

	@Column({ type: 'int', nullable: true })
	images: number | null;

	@Column({ default: false })
	isClaimed: boolean;

	@OneToOne(() => Payment, (payment) => payment.booking)
	payment: Payment;
}
