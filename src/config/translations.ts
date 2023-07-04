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
		en: `
Choose the bot's personality, and it will give the answers corresponding to its role
Current role - :role
		`,
		ru: `
Выберите личность боту, и он будет подбирать ответы, соответствующие его роли
Текущая роль - :role
		`
	},
	roleChanged: {
		en: 'Role changed to ',
		ru: 'Роль изменена, теперь бот будет отвечать как '
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
			ru: 'Символы: '
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
				en: 'All limits update once a month',
				ru: 'Все лимиты обновляются раз в месяц'
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

300000 tokens per month
120 seconds of audio per month
5 image generations per month

Price: 100 ₽			
			`,
			ru: `
			*Plus:*
После покупки подписки лимиты вырастут до:
300000 символов в месяц 
120 секунд аудио в месяц
5 генераций картинок в месяц
			
Стоимость: 100 ₽`
		},
		'Plus++': {
			en: `
			*Plus\\+\\+:*
After purchasing a subscription, the limits will increase to:

700000 tokens per month
240 seconds of audio per month
10 image generations per month

Price: 200 ₽			
			`,
			ru: `
			*Plus\\+\\+:*
После покупки подписки лимиты вырастут до:
700000 символов в месяц 
240 секунд аудио в месяц
10 генераций картинок в месяц
			
Стоимость: 200 ₽`
		},
		Premium: {
			en: `
			*Premium:*
After purchasing a subscription, the limits will increase to:

1500000 tokens per month
1000 seconds of audio per month
25 image generations per month

Price: 500 ₽			
			`,
			ru: `
			*Premium:*
После покупки подписки лимиты вырастут до:
1500000 символов в месяц 
1000 секунд аудио в месяц
25 генераций картинок в месяц
			
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
		},
		quality: {
			en: 'Image Quality',
			ru: 'Качество изображения'
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
	},
	payments: {
		subscriptionSuccess: {
			en: 'Your subscription has been acquired',
			ru: 'Подписка оформлена'
		},
		bookingSuccess: {
			en: 'Congratulations on your purchase!',
			ru: 'Поздравляем с покупкой!'
		},
		expired: {
			en: 'Your subscription expired',
			ru: 'Ваша подписка закончилась'
		},
		updated: {
			en: 'Your limits have updated',
			ru: 'Ваши лимиты обновились'
		},
		content: {
			en: `
Limits now:
Tokens: 25000
Audio: 30
Images: 2
			`,
			ru: `
Лимиты сейчас:
Символы: 25000
Аудио: 30
Картинки: 2
			`
		},
		button: {
			en: 'Buy subscription',
			ru: 'Купить подписку'
		}
	},
	errors: {
		smth: {
			en: 'Something went wrong',
			ru: 'Что-то пошло не так'
		},
		limitsExceeded: {
			en: 'The character limit has been exceeded. For further use, purchase a subscription',
			ru: 'Превышен лимит символов. Для дальнейшего пользования приобретите подписку'
		},
		lengthLess: {
			en: 'The request length cannot be shorter than two characters',
			ru: 'Длина запроса не может быть короче двух символов'
		},
		lengthMore: {
			en: 'The request length cannot be more than two thousand characters',
			ru: 'Длина запроса не может быть более двух тысяч символов'
		},
		manyRequests: {
			en: 'Too many requests. Wait for a while…',
			ru: 'Слишком много запросов, подождите…'
		},
		wait: {
			en: '⏳ Please, wait. . .',
			ru: '⏳ Пожалуйста, подождите. . .'
		},
		serversThrottling: {
			en: 'Servers are unavailable now, please try again later',
			ru: 'Сервера переполнены, попробуйте позже'
		},
		contextLimitExceeded: {
			en: 'The request history is full. To clean up, use the /restart command',
			ru: 'История запросов переполнена. Для очистки воспользуйтесь командой /restart'
		},
		unknown: {
			en: 'Unknown error. Contact technical support @topbestb',
			ru: 'Неизвестная ошибка. Обратитесь в техподдержку @topbestb'
		}
	},
	welcome: {
		en: `
ChatGPT is ready to use!

⚡️The bot uses GPT-3.5, GPT-4 models

Here is a list of what this bot can do:
	- Write unique texts
	- Rewrite texts
	- Write and edit code
	- Translate from any language
	- Retell anything
	- and much more…

Instruction manual:
🔤 To recieve a text answer, write your question in any language. You can also record a voice message with your request.
	🚀 To switch between GPT-3.5 and GPT-4 models, use the /model command (note that the GPT-4 model is only available with subscription).
	✅ Symbols are necessary for the bot to work and are taken into account both in the request and in the response, as well as in the chat history, in order to spend less characters, use the / comandaaYAzabil command after finishing the dialog.
	👤 To view your balance, use the command /profile
	💳 To purchase and manage your subscription, use the /subscribe command

Limitations:
	😀  Each user using the free plan has a limit on the number of characters:
At the moment you have :tokens characters available for a month.
You can send a request using voice messages, but no more than :audio seconds per month.		
		`,
		ru: `
ChatGPT готов к использованию!

⚡️Бот использует модели GPT-3.5, GPT-4

Вот некоторый список того, что умеет данный бот:
- Писать уникальные тексты
- Делать рерайт текстов
- Писать и редактировать код
- Перевод с любого языка
- Пересказывать что-либо
- и многое другое…

Инструкция:
🔤 Чтобы получить текстовый ответ, напишите свой вопрос на любом языке. Также вы можете просто записать голосовое сообщение с вашим запросом.
🚀 Чтобы переключиться между моделями GPT-3.5 и GPT-4, используйте команду /model (обратите внимание, что модель GPT-4 доступна только по подписке).
✅ Символы необходимы для работы бота и учитываются как в запросе, так и в ответе, а также в истории переписки, поэтому, чтобы потратить меньше символов, используйте команду /restart после окончания диалога.
👤 Чтобы посмотреть свой баланс, используйте команду /profile
💳 Для покупки и для управления подпиской используйте команду /subscribe

Ограничения:
😀 Каждый пользователь, использующий бесплатный тариф имеет ограничение на количество символов:
На данный момент у вас доступно :tokens символов на месяц.
Вы можете отправлять запрос с помощью голосовых сообщений, но не больше чем :audio секунд на месяц.
		`
	}
};

export default translations;
