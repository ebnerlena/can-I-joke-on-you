'use client';

import { useEffect, useRef, useState } from 'react';
import { useFaceLandmarkDetector } from '../utils/useDetector';
import Webcam from 'react-webcam';
import { CalibrationStatus } from '@/types/CalibrationStatus';
import { useRouter } from 'next/navigation';
import { useCalibrationStore } from '@/store/store';
import { CalibrationMode } from '@/types/CalibrationMode';

type Props = {
	vidoeHeight?: number;
	videoWidth?: number;
};

const FaceLandmarkerCalibration: React.FC<Props> = ({ videoWidth, vidoeHeight }) => {
	const webcamRef = useRef<Webcam>(null);

	const [error, setError] = useState<string | null>(null);

	const { activateWebcamStream, startCalibration, setVideoNode, calibrationStatus } = useFaceLandmarkDetector();
	const router = useRouter();
	const setCalibrationStatus = useCalibrationStore((state) => state.setStatus);

	useEffect(() => {
		setCalibrationStatus(CalibrationMode.NEUTRAL);

		if (webcamRef.current) {
			if (webcamRef.current.video) setVideoNode(webcamRef.current.video);
		}
	}, []);

	useEffect(() => {
		if (!webcamRef.current?.state.hasUserMedia || !webcamRef.current.video) {
			setError('Webcam not enabled. Please allow and enable.');
			return;
		} else {
			setError(null);

			setTimeout(() => activateWebcamStream(startCalibration), 1500);
		}
	}, [webcamRef.current?.state]);

	useEffect(() => {
		if (calibrationStatus === CalibrationStatus.DONE) {
			router.push('/calibration/smile');
		}
	}, [calibrationStatus, router]);

	const inputResolution = {
		width: videoWidth ?? 1080 / 4,
		height: vidoeHeight ?? 900 / 4,
	};

	const videoConstraints = {
		width: inputResolution.width,
		height: inputResolution.height,
		facingMode: 'user',
	};

	return (
		<div className="">
			<div className="flex gap-1 pb-2 w-full items-center justify-center">
				{/* {error && <p className="text-red-600 text-xl font-bold">Waiting for webcam... {error} </p>} */}
			</div>
			<Webcam ref={webcamRef} videoConstraints={videoConstraints} />
		</div>
	);
};

export default FaceLandmarkerCalibration;
