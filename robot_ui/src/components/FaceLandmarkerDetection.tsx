import { useEffect, useRef } from 'react';
import { CalibrationStatus, useFaceLandmarkDetector } from '../utils/useDetector';
import Webcam from 'react-webcam';

const FaceLandmarkerDetection = () => {
	const webcamRef = useRef<Webcam>(null);

	const {
		enableWebcam,
		isInitialized,
		mood,
		smileDegree,
		calibrationStatus,
		calibrate,
		stopCalibration,
		predictWebcam,
		webcamRunning,
		webcamEnabled,
		setVideoNode,
	} = useFaceLandmarkDetector();
	console.log('Mood: ' + mood, 'Smile Degree: ' + smileDegree);

	useEffect(() => {
		if (webcamRef.current) {
			console.log(webcamRef.current.video);

			if (webcamRef.current.video) setVideoNode(webcamRef.current.video);
		}
	}, []);

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
				<button className="btn" onClick={calibrationStatus === CalibrationStatus.DOING ? stopCalibration : calibrate}>
					{calibrationStatus === CalibrationStatus.DOING ? 'Stop calibration' : 'Calibrate'}
				</button>
				<button className="btn" onClick={predictWebcam}>
					Predict
				</button>
			</div>
			<Webcam ref={webcamRef} videoConstraints={videoConstraints} />
		</div>
	);
};

export default FaceLandmarkerDetection;
