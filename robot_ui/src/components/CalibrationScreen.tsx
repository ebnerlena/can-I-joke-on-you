'use client';

import { useEffect, useState } from 'react';
import FaceLandmarkerCalibration from './FaceLandmarkerCalibration';
import { useApplicationStore } from '@/store/store';
import { ApplicationStatus } from '@/types/ApplicationStatus';
import { useRouter } from 'next/navigation';

const CalibrationScreen = () => {
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
				<p>We are now doing the calibration on your face.</p>
				<p>
					Please just try to keep a <span className="font-bold">NEUTRAL</span> face until we are finished.
				</p>
				<p>Seconds: {secondsLeft}</p>
			</div>

			<FaceLandmarkerCalibration videoWidth={1080 / 2} vidoeHeight={900 / 2} />
		</div>
	);
};

export default CalibrationScreen;
