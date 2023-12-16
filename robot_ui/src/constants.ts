import path from 'path';

export const BACKEND_URL = `${process.env.NEXT_PUBLIC_BACKEND_PROTOCOL ?? 'http'}://${
	process.env.NEXT_PUBLIC_BACKEND_HOST ?? 'localhost'
}:${process.env.NEXT_PUBLIC_BACKEND_PORT ?? 5000}`;

export const ROUTES = {
	HOME: '/',
	START_NEUTRAL_CALIBRATION: '/start',
	START_SMILE_CALIBRATION: '/calibration/smile',
	CALIBRATION: '/calibration',
	SMILE_CALIBRATION: '/smile-calibration',
	MAIN: '/main',
	END: '/end',
};

export const LOGS_DIR = path.join(process.env.ROOT_DIR || process.cwd(), 'public/logs');
