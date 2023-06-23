import { DataSourceOptions } from 'typeorm';
import config from '.';

export const ormconfig: DataSourceOptions = {
	type: 'postgres',
	host: config.DB_HOST,
	port: config.DB_PORT,
	username: config.DB_USER,
	password: config.DB_PASSWORD,
	database: config.DB_NAME,
	synchronize: true,
	logging: false
};
