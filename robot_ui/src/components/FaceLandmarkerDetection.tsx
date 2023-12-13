'use client';

import { SyntheticEvent, useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';

type Props = {
	onWebcamRefReceived: (videoElement: HTMLVideoElement) => void;
};

const FaceLandmarkerDetection: React.FC<Props> = ({ onWebcamRefReceived }) => {
	const [loaded, setLoaded] = useState(false);
	const inputResolution = {
		width: 1080 / 5,
		height: 900 / 5,
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

		onWebcamRefReceived(video);
		setLoaded(true);
	};

	return (
		<div className="absolute bottom-2 right-4 z-10">
			<Webcam videoConstraints={videoConstraints} onLoadedData={handleVideoLoad} />
		</div>
	);
};

export default FaceLandmarkerDetection;
