'use client';

import { SyntheticEvent, useEffect, useRef, useState } from 'react';
import { useFaceLandmarkDetector } from '../utils/useDetector';
import Webcam from 'react-webcam';
import { CalibrationStatus } from '@/types/CalibrationStatus';
import { useRouter } from 'next/navigation';
import { useCalibrationStore } from '@/store/store';
import { CalibrationMode } from '@/types/CalibrationMode';
import { ROUTES } from '@/constants';

type Props = {
	videoHeight?: number;
	videoWidth?: number;
};

const FaceLandmarkerSmileCalibration: React.FC<Props> = ({ videoWidth, videoHeight }) => {
	const webcamRef = useRef<Webcam>(null);
	const [error, setError] = useState<string | null>(null);
	const [loaded, setLoaded] = useState(false);

	const { startCalibration, setVideoNode, calibrationStatus } = useFaceLandmarkDetector();
	const router = useRouter();
	const setCalibrationStatus = useCalibrationStore((state) => state.setStatus);

	useEffect(() => {
		setCalibrationStatus(CalibrationMode.SMILE);
	}, []);

	useEffect(() => {
		if (calibrationStatus === CalibrationStatus.DONE) {
			router.push(ROUTES.MAIN);
		}
	}, [calibrationStatus, router]);

	const inputResolution = {
		width: videoWidth ?? 1080 / 4,
		height: videoHeight ?? 900 / 4,
	};

	const videoConstraints = {
		width: inputResolution.width,
		height: inputResolution.height,
		facingMode: 'user',
	};

	const handleVideoLoad = (videoEvent: SyntheticEvent<HTMLVideoElement, Event>) => {
		const video = videoEvent.target as HTMLVideoElement;

		if (video.readyState !== 4) return;
		if (loaded) return;

		setVideoNode(video);

		setTimeout(() => startCalibration(), 1000);
		setLoaded(true);
	};

	return (
		<div className="">
			<div className="flex gap-1 pb-2 w-full items-center justify-center">
				{/* {error && <p className="text-red-600 text-xl font-bold">Waiting for webcam... {error} </p>} */}
			</div>
			<Webcam ref={webcamRef} videoConstraints={videoConstraints} onLoadedData={handleVideoLoad} />
		</div>
	);
};

export default FaceLandmarkerSmileCalibration;
