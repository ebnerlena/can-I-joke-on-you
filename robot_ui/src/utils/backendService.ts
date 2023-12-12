import { BACKEND_URL } from '@/constants';

export const postRequest = async (url: string, body: any) => {
	const response = await fetch(`${BACKEND_URL}/${url}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});

	const data = await response.json();

	return data;
};
