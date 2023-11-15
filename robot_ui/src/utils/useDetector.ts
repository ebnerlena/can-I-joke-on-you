import { useEffect, useState } from 'react';
import { FaceLandmarker, FaceLandmarkerResult, FilesetResolver } from '@mediapipe/tasks-vision';

interface FaceLandmarkDetectorType {
	calibrationStatus: CalibrationStatus;
	webcamRunning: boolean;
	webcamEnabled: boolean;
	mood: Mood;
	smileDegree: number;
	isInitialized: boolean;
	calibrate: () => void;
	stopCalibration: () => void;
	enableWebcam: () => void;
	predictWebcam: () => void;
	setVideoNode: (video: HTMLVideoElement) => void;
}

export enum CalibrationStatus {
	NOT_READY,
	READY,
	DOING,
	DONE,
}
export enum Mood {
	NEUTRAL,
	SLIGHT_SMILE,
	BIG_SMILE,
}

type FaceLandmarkerBlendValues = {
	mouthPressLeft: number;
	mouthPressRight: number;
	mouthSmileLeft: number;
	mouthSmileRight: number;
};

const initialFaceLandmarkerBlendValues = {
	mouthPressLeft: 0,
	mouthPressRight: 0,
	mouthSmileLeft: 0,
	mouthSmileRight: 0,
};

let lastVideoTime = -1;

export const useFaceLandmarkDetector = (): FaceLandmarkDetectorType => {
	const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker>();
	const [isInitialized, setIsInitialized] = useState<boolean>(false);
	const [video, setVideo] = useState<HTMLVideoElement | null>(null);
	const [runningMode] = useState<'VIDEO' | 'IMAGE'>('VIDEO');
	const [webcamRunning, setWebcamRunning] = useState<boolean>(false);
	const [webcamEnabled, setWebcamEnabled] = useState<boolean>(false);
	const [calibrationFrames, setCalibrationFrames] = useState<number>(0);
	const [calibrationStatus, setCalibrationStatus] = useState<CalibrationStatus>(CalibrationStatus.NOT_READY);
	const [mood, setMood] = useState<Mood>(Mood.NEUTRAL);
	const [smileDegree, setSmileDegree] = useState<number>(0);
	const [calibrationBlendValues, setCalibrationBlendValues] = useState<FaceLandmarkerBlendValues>(
		initialFaceLandmarkerBlendValues,
	);

	const initFacelandmarks = async () => {
		const vision = await FilesetResolver.forVisionTasks(
			'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm',
		);

		const landmarker = await FaceLandmarker.createFromModelPath(
			vision,
			'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
		);

		await landmarker.setOptions({
			runningMode: runningMode,
			numFaces: 1,
			outputFaceBlendshapes: true,
		});

		setFaceLandmarker(landmarker);
		setIsInitialized(true);

		if (isWebcamIsEnabled()) {
			setCalibrationStatus(CalibrationStatus.READY);
			setWebcamRunning(true);
			setWebcamEnabled(true);
		}
	};

	const isWebcamIsEnabled = (): boolean => {
		return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
	};

	const stopCalibration = () => {
		console.log('stopCalibration', calibrationStatus);

		setCalibrationStatus(CalibrationStatus.DONE);
	};

	const storeCalibrations = async () => {
		console.log('storeCalibrations', calibrationStatus);
		if (!faceLandmarker || !video) return;

		let startTimeMs = performance.now();
		let results: FaceLandmarkerResult | null = null;

		if (lastVideoTime !== video.currentTime) {
			lastVideoTime = video.currentTime;
			results = faceLandmarker.detectForVideo(video, startTimeMs);
			console.log(results);
		}

		if (!results || results.faceBlendshapes.length === 0) return;

		const { faceBlendshapes } = results;

		console.log(results, faceBlendshapes);

		for (var key in faceBlendshapes[0].categories) {
			var blendName = faceBlendshapes[0].categories[key].categoryName;
			var blendScore = faceBlendshapes[0].categories[key].score;

			if (calibrationBlendValues.hasOwnProperty(blendName)) {
				// @ts-ignore
				calibrationBlendValues[blendName] += blendScore;
			}
		}
		setCalibrationFrames(calibrationFrames + 1);

		console.log(calibrationBlendValues);

		// Call this function again to keep predicting when the browser is ready.
		// if (calibrationStatus === CalibrationStatus.DOING) {
		// 	requestAnimationFrame(storeCalibrations);
		// }
	};

	const calibrate = () => {
		if (!faceLandmarker || !video) {
			console.log('Wait! faceLandmarker not loaded yet.');
			return;
		}

		setCalibrationStatus(CalibrationStatus.DOING);
		setCalibrationBlendValues(initialFaceLandmarkerBlendValues);
		setCalibrationFrames(0);

		requestAnimationFrame(storeCalibrations);

		// getUsermedia parameters.
		// const constraints = {
		// 	video: true,
		// };
		// Activate the webcam stream.
		// navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
		// 	video.srcObject = stream;
		// 	video.addEventListener('loadeddata', storeCalibrations);
		// });
	};

	const updateBlendValues = (faceBlendshapes: any) => {
		console.log('updateBlendValues', faceBlendshapes);
		let blendFactors: FaceLandmarkerBlendValues = {
			mouthPressLeft: 0,
			mouthPressRight: 0,
			mouthSmileLeft: 0,
			mouthSmileRight: 0,
		};

		for (const key in faceBlendshapes[0].categories) {
			let blendName = faceBlendshapes[0].categories[key].categoryName;
			let blendScore = faceBlendshapes[0].categories[key].score;

			if (blendName in blendFactors && calibrationBlendValues.hasOwnProperty(blendName)) {
				// @ts-ignore
				blendFactors[blendName] += blendScore / (calibrationBlendValues[blendName] / calibrationFrames); // @ts-ignore
			}
		}

		calculateMood(blendFactors);
	};

	const calculateMood = (blendValues: FaceLandmarkerBlendValues) => {
		console.log('calculateMood');
		// Calculate the mood and degree
		let newMood = Mood.NEUTRAL;
		let mouthPressFactor = (blendValues['mouthPressLeft'] + calibrationBlendValues['mouthPressRight']) / 4;
		if (mouthPressFactor > 1) {
			newMood = Mood.SLIGHT_SMILE;
		} else {
			newMood = Mood.NEUTRAL;
		}

		let mouthSmileFactor = (calibrationBlendValues['mouthSmileLeft'] + calibrationBlendValues['mouthSmileRight']) / 500;
		if (mouthSmileFactor > 1) {
			newMood = Mood.BIG_SMILE;
		}

		console.log('new mood', Mood[newMood]);
		setMood(newMood);

		let tmpSmileDegree = 0;
		if (mouthSmileFactor < 1) {
			if (mouthPressFactor < 1) {
				tmpSmileDegree = 0;
			} else if (mouthPressFactor < 2) {
				tmpSmileDegree = 1;
			} else if (mouthPressFactor >= 2) {
				tmpSmileDegree = 2;
			}
		} else if (mouthSmileFactor < 2) {
			tmpSmileDegree = 3;
		} else if (mouthSmileFactor >= 2) {
			tmpSmileDegree = 4;
		}

		console.log('set smile degree', tmpSmileDegree);
		setSmileDegree(tmpSmileDegree);
	};

	// TODO call this when video is enabled
	const predictWebcam = () => {
		console.log('predictWebcam');
		if (!faceLandmarker || !video) return;
		let startTimeMs = performance.now();
		let results: FaceLandmarkerResult | null = null;

		if (lastVideoTime !== video.currentTime) {
			lastVideoTime = video.currentTime;
			results = faceLandmarker.detectForVideo(video, startTimeMs);
		}
		if (results && results.faceBlendshapes?.length > 0) {
			const { faceBlendshapes } = results;
			updateBlendValues(faceBlendshapes);
		}

		// TODO how to handle this...
		// Call this function again to keep predicting when the browser is ready.
		// if (webcamRunning === true) {
		// 	requestAnimationFrame(predictWebcam);
		// }
	};

	const enableWebcam = () => {
		console.log(faceLandmarker, video);
		if (!faceLandmarker || !video) {
			console.log('Wait! faceLandmarker not loaded yet.');
			return;
		}
		if (webcamRunning === true) {
			setWebcamRunning(false);
		} else {
			setWebcamRunning(true);
		}
		// getUsermedia parameters.
		const constraints = {
			video: true,
		};
		// Activate the webcam stream.
		navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
			video.srcObject = stream;
			video.addEventListener('loadeddata', predictWebcam);
		});
	};

	useEffect(() => {
		initFacelandmarks();
	}, []);

	return {
		calibrationStatus: calibrationStatus,
		webcamRunning: webcamRunning,
		webcamEnabled: webcamEnabled,
		mood: mood,
		smileDegree: smileDegree,
		isInitialized: isInitialized,
		calibrate: calibrate,
		stopCalibration: stopCalibration,
		enableWebcam: enableWebcam,
		predictWebcam: predictWebcam,
		setVideoNode: (video: HTMLVideoElement) => setVideo(video),
	};
};
