'use client';

import { useEffect, useState } from 'react';
import FaceLandmarkerSmileCalibration from './FaceLandmarkerSmileCalibration';
import { useApplicationStore } from '@/store/store';

const SmileCalibrationScreen = () => {
	const [secondsLeft, setSecondsLeft] = useState(0);

	const applicationError = useApplicationStore((state) => state.error);

	useEffect(() => {
		const countdownInterval = setInterval(() => {
			setSecondsLeft((prevSeconds) => prevSeconds + 1);
		}, 1000);

		// Clear the interval when the component unmounts
		return () => clearInterval(countdownInterval);
	}, [secondsLeft]);

	return (
		<div className="w-full  h-full flex flex-col items-center justify-center gap-4 p-12">
			<div className="text-justify text-xl">
				<p>
					We are now doing the <span className="font-bold">SMILE</span> calibration on your face.
				</p>
				<p>Please SMILE as big as you can until we are finished.</p>
				<p>Seconds: {secondsLeft}</p>
			</div>

			{applicationError && <p className="text-red-500 py-1">{applicationError}</p>}

			<FaceLandmarkerSmileCalibration videoWidth={1080 / 2} videoHeight={900 / 2} />
		</div>
	);
};

export default SmileCalibrationScreen;
