export const rolesObj: Record<string, string> = {
	Обычный: '',
	Гопник: 'Отвечай как гопник \n',
	Рэпер: 'Отвечай как рэпер \n'
};

export const getRole = (role: string | null) => (role ? rolesObj[role] : '');
