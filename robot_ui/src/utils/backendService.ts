import { BACKEND_URL } from '@/constants';

export const postRequest = async (url: string, body: any) => {
	const response = await fetch(`http://localhost:3000/api/${url}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: body,
	});

	const data = await response.json();

	return data;
};
