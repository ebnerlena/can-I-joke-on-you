'use client';

import { useEffect, useRef } from 'react';
import Webcam from 'react-webcam';

type Props = {
	onWebcamRefReceived: (videoElement: HTMLVideoElement) => void;
};

const FaceLandmarkerDetection: React.FC<Props> = ({ onWebcamRefReceived }) => {
	const webcamRef = useRef<Webcam>(null);

	useEffect(() => {
		if (webcamRef.current) {
			if (webcamRef.current.video) {
				onWebcamRefReceived(webcamRef.current.video);
			}
		}
	}, [onWebcamRefReceived]);

	const inputResolution = {
		width: 1080 / 5,
		height: 900 / 5,
	};

	const videoConstraints = {
		width: inputResolution.width,
		height: inputResolution.height,
		facingMode: 'user',
	};

	return (
		<div className="absolute bottom-2 right-4 z-10">
			<Webcam ref={webcamRef} videoConstraints={videoConstraints} />
		</div>
	);
};

export default FaceLandmarkerDetection;
