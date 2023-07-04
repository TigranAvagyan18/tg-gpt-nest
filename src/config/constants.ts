import { GptModels, Languages, Roles } from 'src/entities/user/user.entity';
import translations from './translations';

// Hear
export const LANGUAGE_HEARS = Object.values(translations.menu.language);
export const PROFILE_HEARS = Object.values(translations.menu.profile);
export const MODEL_HEARS = Object.values(translations.menu.model);
export const ROLE_HEARS = Object.values(translations.menu.roles);
export const SUBSCRIPTION_HEARS = Object.values(translations.menu.subscribe);
export const IMAGE_HEARS = Object.values(translations.menu.images);

// Commands
export const LANGUAGE_COMMAND = 'language';
export const PROFILE_COMMAND = 'profile';
export const MODEL_COMMAND = 'model';
export const ROLE_COMMAND = 'role';
export const SUBSCRIBE_COMMAND = 'subscribe';
export const IMAGE_COMMAND = 'image';
export const BUT_TOKENS_COMMAND = 'buytokens';
export const RESTART_COMMAND = 'restart';

// Actions
export const LANGUAGE_ACTION = Object.values(Languages);
export const MODEL_ACTION = Object.values(GptModels);
export const ROLE_ACTION = Object.keys(Roles);
export const SUBSCRIPTION_ACTION = ['Plus', 'Plus++', 'Premium'];
