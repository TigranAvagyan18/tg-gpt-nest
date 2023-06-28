const translations = {
	chooseLanguage: {
		en: 'Choose Language',
		ru: '*Выбери язык интерфейса:*\n_Язык можно будет поменять в любой момент с помощью команды /language_\n\n*Select the interface language:*\n_You can change the language at any time via the command /language_'
	},
	languageChanged: {
		en: 'Language changed to ',
		ru: 'Язык изменен на '
	},
	currentModel: {
		en: 'Current model - ',
		ru: 'Текущая модель - '
	},
	modelChanged: {
		en: 'Model changed to ',
		ru: 'Модель изменен на '
	},
	chooseRole: {
		en: 'Choose role, current - ',
		ru: 'Выберите роль \nТекущая роль - '
	},
	roleChanged: {
		en: 'Role changed to ',
		ru: 'Роль изменен на '
	},
	menu: {
		language: {
			en: 'Language',
			ru: 'Язык'
		},
		profile: {
			en: 'Profile',
			ru: 'Профиль'
		},
		model: {
			en: 'Model',
			ru: 'Модель'
		},
		roles: {
			en: 'Roles',
			ru: 'Роли'
		},
		images: {
			en: 'Generate Images',
			ru: 'Генерация Картинок'
		},
		subscribe: {
			en: 'Subscriptions',
			ru: 'Подписка'
		}
	},
	profile: {
		limits: {
			en: '*Account limits:*',
			ru: '*Лимиты аккаунта:*'
		},
		tokens: {
			en: 'Tokens: ',
			ru: 'Символы:'
		},
		audio: {
			en: 'Audio in seconds: ',
			ru: 'Аудио в секундах: '
		},
		images: {
			en: 'Pictures: ',
			ru: 'Картинки: '
		},
		bookedTokens: {
			en: 'Purchased tokens: ',
			ru: 'Куплено токенов: '
		},
		subscription: {
			en: 'Subscription: ',
			ru: 'Подписка: '
		},
		limitsUpdate: {
			content: {
				en: 'All limits update once a week',
				ru: 'Все лимиты обновляются раз в неделю'
			},
			date: {
				en: 'The next limit update will be on: ',
				ru: 'Следующее обновление лимита произойдет: '
			}
		},
		referral: {
			title: {
				en: '*Referral program:*',
				ru: '*Реферальная программа:*'
			},
			invite: {
				en: 'Invite a friend and get 1000 tokens to your limit',
				ru: 'Пригласи друга и получи 1000 символов к лимиту'
			},
			invited: {
				en: 'Invited users: ',
				ru: 'Приглашено пользователей: '
			},
			inviteLink: {
				en: 'Invite link: ',
				ru: 'Ссылка для приглашения: '
			}
		}
	},
	subscriptions: {
		buy: {
			content: {
				en: 'Buy tokens',
				ru: 'Купить символы'
			},
			tokens: {
				en: `*Buy tokens only:*
If you need to buy tokens only, use \\/buytokens command and enter the number of tokens

The minimum number of tokens is 10 000, the maximum is 30 000 000\\.

The price of 2000 tokens is 1 ₽				
				`,
				ru: `*Купить только символы:*

Если вам нужно купить только символы, то воспользуйтесь командой \\/buytokens и введите число токенов
				
Минимальное число символов 10 000, максимальное \\- 30 000 000\\.
				
Стоимость 2000 символов \\- 1 ₽
				
_Пример запроса: \\/buytokens 10000_
				`
			},
			queryExample: {
				en: '_Request example: /buytokens 10000_',
				ru: '_Пример запроса: \\/buytokens 10000_'
			},
			action: {
				result: {
					en: '_When buying tokens, you will receive :amount tokens once_',
					ru: '_При покупке символов вы получите :amount символов единоразово_'
				},
				price: {
					en: '_Price: :price ₽_',
					ru: '_Стоимость: :price ₽_'
				}
			}
		},
		pay: {
			en: 'Pay',
			ru: 'Оплатить'
		},
		choose: {
			en: 'If you have run out of limit, you can purchase one of the existing tariff plans:',
			ru: 'Если у вас закончился лимит, то вы можете приобрести один из предложенных тарифных планов:'
		},
		Plus: {
			en: `
			*Plus:*
After purchasing a subscription, the limits will increase to:

75000 tokens per week
30 seconds of audio per week
5 image generations per week

Price: 100 ₽			
			`,
			ru: `
			*Plus:*
После покупки подписки лимиты вырастут до:
75000 символов в неделю 
30 секунд аудио в неделю
5 генераций картинок в месяц
			
Стоимость: 100 ₽`
		},
		'Plus++': {
			en: `
			*Plus\\+\\+:*
After purchasing a subscription, the limits will increase to:

175000 tokens per week
60 seconds of audio per week
5 image generations per week

Price: 200 ₽			
			`,
			ru: `
			*Plus\\+\\+:*
После покупки подписки лимиты вырастут до:
175000 символов в неделю 
60 секунд аудио в неделю
10 генераций картинок в месяц
			
Стоимость: 200 ₽`
		},
		Premium: {
			en: `
			*Premium:*
After purchasing a subscription, the limits will increase to:

400000 tokens per week
500 seconds of audio per week
5 image generations per week

Price: 500 ₽			
			`,
			ru: `
			*Premium:*
После покупки подписки лимиты вырастут до:
400000 символов в неделю 
500 секунд аудио в неделю
50 генераций картинок в месяц
			
Стоимость: 500 ₽`
		}
	},
	images: {
		create: {
			en: `
Create unique images using the DELL\\-E neural network\\. 
To generate an image, use the command \\/image with a brief description

_Request example: \\/image сat on a pizza flying through space_
`,
			ru: `
Создавайте уникальные картинки с помощью нейросети DALL\\-E\\. 
Чтобы сгенерировать картинку, используйте команду \\/image с кратким описанием

_Пример запроса: \\/image сat on a pizza flying through space_
			`
		}
	},
	referrals: {
		completed: {
			en: `
User :username registered via your link 
Total number of invited users: :count
			`,
			ru: `
Пользователь :username зарегистрировался по вашей ссылки 
Суммарное количество приглашенных пользователей: :count
			`
		}
	}
};

export default translations;
