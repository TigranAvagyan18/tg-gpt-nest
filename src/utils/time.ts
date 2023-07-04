export const formatMilliseconds = (milliseconds: number) => {
	const date = new Date(milliseconds + 30 * 24 * 60 * 60 * 1000);
	const day = date.getDate().toString().padStart(2, '0');
	const month = (date.getMonth() + 1).toString().padStart(2, '0');
	const year = date.getFullYear();

	return `${day}\\.${month}\\.${year}`;
};
