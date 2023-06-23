export const rolesObj: Record<string, string> = {
	Обычный: 'Отвечай как нормальный \n',
	Гопник: 'Отвечай как гопник \n',
	Рэпер: 'Отвечай как рэпер \n',
	Деревенщина: 'Отвечай как деревенщина \n'
};

export const getRole = (role: string | null) => (role ? rolesObj[role] : '');
