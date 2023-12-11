export const BACKEND_URL = `http://localhost:${process.env.BACKEND_PORT ?? 5000}`;

export const ROUTES = {
	HOME: '/',
	START_NEUTRAL_CALIBRATION: '/start',
	START_SMILE_CALIBRATION: '/calibration/smile',
	CALIBRATION: '/calibration',
	SMILE_CALIBRATION: '/smile-calibration',
	MAIN: '/main',
	END: '/end',
};
