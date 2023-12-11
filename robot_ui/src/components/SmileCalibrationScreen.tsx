'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FaceLandmarkerSmileCalibration from './FaceLandmarkerSmileCalibration';

const SmileCalibrationScreen = () => {
	const [secondsLeft, setSecondsLeft] = useState(0);

	const router = useRouter();

	useEffect(() => {
		const countdownInterval = setInterval(() => {
			setSecondsLeft((prevSeconds) => prevSeconds + 1);
		}, 1000);

		// Clear the interval when the component unmounts
		return () => clearInterval(countdownInterval);
	}, [secondsLeft, router]);

	return (
		<div className="w-full  h-full flex flex-col items-center justify-center gap-8 p-12">
			<div className="text-justify text-xl">
				<p>
					We are now doing the <span className="font-bold">SMILE</span> calibration on your face.
				</p>
				<p>Please SMILE as big as you can until we are finished.</p>
				<p>Seconds: {secondsLeft}</p>
			</div>

			<FaceLandmarkerSmileCalibration videoWidth={1080 / 2} videoHeight={900 / 2} />
		</div>
	);
};

export default SmileCalibrationScreen;
