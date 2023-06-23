import 'dotenv/config';
import { cleanEnv, host, port, str } from 'envalid';

const env = cleanEnv(process.env, {
	APP_ENV: str({ choices: ['dev', 'stage', 'prod'], default: 'dev' }),

	BACKEND_HOST: str(),

	DB_NAME: str(),
	DB_HOST: host(),
	DB_PORT: port(),
	DB_USER: str(),
	DB_PASSWORD: str(),

	OPENAI_ORGANIZATION: str(),
	OPENAI_API_KEY: str(),

	TELEGRAM_TOKEN: str(),

	YOOMONEY_TOKEN: str()
});

const config = {
	APP_ENV: env.APP_ENV,

	BACKEND_HOST: env.BACKEND_HOST,

	DB_NAME: env.DB_NAME,
	DB_HOST: env.DB_HOST,
	DB_PORT: env.DB_PORT,
	DB_USER: env.DB_USER,
	DB_PASSWORD: env.DB_PASSWORD,

	OPENAI_ORGANIZATION: env.OPENAI_ORGANIZATION,
	OPENAI_API_KEY: env.OPENAI_API_KEY,

	TELEGRAM_TOKEN: env.TELEGRAM_TOKEN,

	YOOMONEY_TOKEN: env.YOOMONEY_TOKEN
};

export default config;
