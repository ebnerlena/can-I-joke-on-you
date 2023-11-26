'use client';

import { useEffect, useState } from 'react';
import FaceLandmarkerCalibration from './FaceLandmarkerCalibration';
import { useApplicationStore } from '@/store/store';
import { ApplicationStatus } from '@/types/ApplicationStatus';

const CALIBRATION_TIME = 5;

const CalibrationScreen = () => {
	const [secondsLeft, setSecondsLeft] = useState(CALIBRATION_TIME);
	const setApplicationStatus = useApplicationStore((state) => state.setStatus);

	useEffect(() => {
		if (secondsLeft <= 0) {
			setApplicationStatus(ApplicationStatus.MAIN);
			return;
		}

		const countdownInterval = setInterval(() => {
			if (secondsLeft > 0) {
				setSecondsLeft((prevSeconds) => prevSeconds - 1);
			}
		}, 1000);

		// Clear the interval when the component unmounts
		return () => clearInterval(countdownInterval);
	}, [secondsLeft, setApplicationStatus]);

	return (
		<div className="w-full  h-full flex flex-col items-center justify-center gap-8 p-12">
			<div className="text-justify text-xl">
				<p>We are now doing the calibration on your face.</p>
				<p>Please just try to keep a neutral face until we are finsihed.</p>
				<p>Seconds left: {secondsLeft}</p>
			</div>

			<FaceLandmarkerCalibration videoWidth={1080 / 2} vidoeHeight={900 / 2} />
		</div>
	);
};

export default CalibrationScreen;
