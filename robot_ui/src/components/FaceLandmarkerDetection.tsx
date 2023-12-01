'use client';

import { useEffect, useRef } from 'react';
import { useFaceLandmarkDetector } from '../utils/useDetector';
import Webcam from 'react-webcam';

const FaceLandmarkerDetection = () => {
	const webcamRef = useRef<Webcam>(null);

	const { startPrediction, stopPrediction, setVideoNode } = useFaceLandmarkDetector();

	useEffect(() => {
		if (webcamRef.current) {
			console.log('setting video node', webcamRef.current.video);
			if (webcamRef.current.video) setVideoNode(webcamRef.current.video);
		}
	}, [webcamRef.current]);

	const inputResolution = {
		width: 1080 / 4,
		height: 900 / 4,
	};

	const videoConstraints = {
		width: inputResolution.width,
		height: inputResolution.height,
		facingMode: 'user',
	};

	return (
		<div className="absolute bottom-4 right-4 z-10">
			<div className="flex gap-1 pb-2 w-full items-center justify-center">
				<button className="btn" onClick={stopPrediction}>
					Stop Prediction
				</button>
				<button className="btn" onClick={startPrediction}>
					Predict
				</button>
			</div>
			<Webcam ref={webcamRef} videoConstraints={videoConstraints} />
		</div>
	);
};

export default FaceLandmarkerDetection;
