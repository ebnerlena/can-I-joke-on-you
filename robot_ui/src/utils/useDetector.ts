import { useCallback, useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FaceLandmarkerResult } from '@mediapipe/tasks-vision';
import { FaceLandmarkerBlendValues } from '@/types/FaceLandmarkerBlendValues';
import { CalibrationStatus } from '@/types/CalibrationStatus';
import { Mood } from '@/types/Mood';
import { initialBlendValues, useCalibrationStore } from '@/store/store';
import { FaceLandmarkerService, faceLandmarkerService } from './faceLandMarkerService';

interface FaceLandmarkDetectorType {
	calibrationStatus: CalibrationStatus;
	webcamRunning: boolean;
	webcamEnabled: boolean;
	mood: Mood;
	smileDegree: number;
	isInitialized: boolean;
	activateWebcamStream: (callback: () => void) => void;
	startCalibration: () => void;
	stopCalibration: () => void;
	startPrediction: () => void;
	stopPrediction: () => void;
	setVideoNode: (video: HTMLVideoElement) => void;
}

type DuringCalibrationBlendValues = {
	mouthPressLeft: number[];
	mouthPressRight: number[];
	mouthSmileLeft: number[];
	mouthSmileRight: number[];
};

const initialDuringCalibrationBlendValues = {
	mouthPressLeft: [],
	mouthPressRight: [],
	mouthSmileLeft: [],
	mouthSmileRight: [],
};

let lastVideoTime = -1;
let calibartionStarted = false;
let smileDegrees: number[] = [];

export const useFaceLandmarkDetector = (): FaceLandmarkDetectorType => {
	const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker>();
	const [isInitialized, setIsInitialized] = useState<boolean>(false);
	const [video, setVideo] = useState<HTMLVideoElement | null>(null);
	const [webcamRunning, setWebcamRunning] = useState<boolean>(false);
	const [webcamEnabled, setWebcamEnabled] = useState<boolean>(false);
	const [calibrationFrames, setCalibrationFrames] = useState<number>(0);
	const [predictionFrames, setPredictionFrames] = useState<number>(0);
	const [calibrationStatus, setCalibrationStatus] = useState<CalibrationStatus>(CalibrationStatus.NOT_READY);
	const [predictionStatus, setPredictionStatus] = useState<CalibrationStatus>(CalibrationStatus.NOT_READY);
	const [mood, setMood] = useState<Mood>(Mood.NEUTRAL);
	const [smileDegree, setSmileDegree] = useState<number>(0);
	const [calibrationBlendValues, setCalibrationBlendValues] = useState<DuringCalibrationBlendValues>(
		initialDuringCalibrationBlendValues,
	);

	// Global Store
	const setBlendValuesFromCalibration = useCalibrationStore((state) => state.setBlendValues);
	const blendValuesFromCalibration = useCalibrationStore((state) => state.blendValues);

	// Refs
	const calibrateRequestRef = useRef<number>();
	const predictRequestRef = useRef<number>();

	const initFacelandmarks = useCallback(async () => {
		const landmarker = faceLandmarkerService.faceLandmarker;
		setFaceLandmarker(landmarker);
		setIsInitialized(true);

		if (isWebcamIsEnabled()) {
			setCalibrationStatus(CalibrationStatus.READY);
			setPredictionStatus(CalibrationStatus.READY);
			setWebcamRunning(true);
			setWebcamEnabled(true);
		}
	}, []);

	const isWebcamIsEnabled = (): boolean => {
		return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
	};

	// ************ Calibration ************
	const doCalibration = useCallback(async () => {
		console.log('doCalibration');
		if (!faceLandmarkerService.faceLandmarker || !video) return;

		let startTimeMs = performance.now();
		let results: FaceLandmarkerResult | null = null;

		if (lastVideoTime !== video.currentTime) {
			lastVideoTime = video.currentTime;
			results = faceLandmarkerService.faceLandmarker.detectForVideo(video, startTimeMs);
			console.log(results);
		}

		if (!results || results.faceBlendshapes.length === 0) return;

		const { faceBlendshapes } = results;

		for (var key in faceBlendshapes[0].categories) {
			var blendName = faceBlendshapes[0].categories[key].categoryName;
			var blendScore = faceBlendshapes[0].categories[key].score;

			if (calibrationBlendValues.hasOwnProperty(blendName)) {
				// @ts-ignore
				calibrationBlendValues[blendName].push(blendScore);
			}
		}
		setCalibrationFrames(calibrationFrames + 1);

		doCalibration();
	}, [calibrationBlendValues, calibrationFrames, video]);

	const storeCalibrations = useCallback(async () => {
		console.log('storeCalibrations', calibrationStatus, calibrationBlendValues);

		const tmpBlendValues = { ...initialBlendValues };

		for (var key in calibrationBlendValues) {
			// @ts-ignore
			const values = calibrationBlendValues[key];
			// @ts-ignore
			tmpBlendValues[key] = values.reduce((acc: any, num: any) => acc + num, 0) / values.length;
		}

		setBlendValuesFromCalibration(tmpBlendValues);
	}, [calibrationBlendValues, calibrationStatus, setBlendValuesFromCalibration]);

	const stopCalibration = useCallback(() => {
		console.log('stopCalibration', calibrationStatus);

		setCalibrationStatus(CalibrationStatus.DONE);
		storeCalibrations();
		setVideo(null);
		video?.removeEventListener('loadeddata', startCalibration);
	}, [calibrationStatus, storeCalibrations]);

	const startCalibration = useCallback(() => {
		console.log('startCalibration');
		if (!video) {
			console.log('Wait! video not loaded yet.');
			return;
		}

		setCalibrationBlendValues(initialDuringCalibrationBlendValues);
		setCalibrationFrames(0);
		setCalibrationStatus(CalibrationStatus.DOING);

		setTimeout(stopCalibration, 4000);
	}, [stopCalibration, video]);

	// ************ Prediction ************
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

			if (blendName in blendFactors && blendValuesFromCalibration.hasOwnProperty(blendName)) {
				// @ts-ignore
				blendFactors[blendName] += blendScore / (blendValuesFromCalibration[blendName] / calibrationFrames); // @ts-ignore
			}
		}

		calculateMood(blendFactors);
	};

	const calculateMood = (blendValues: FaceLandmarkerBlendValues) => {
		console.log('calculateMood');
		// Calculate the mood and degree
		let newMood = Mood.NEUTRAL;
		let mouthPressFactor = (blendValues['mouthPressLeft'] + blendValues['mouthPressRight']) / 4;
		if (mouthPressFactor > 1) {
			newMood = Mood.SLIGHT_SMILE;
		} else {
			newMood = Mood.NEUTRAL;
		}

		let mouthSmileFactor = (blendValues['mouthSmileLeft'] + blendValues['mouthSmileRight']) / 500;
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

		smileDegrees.push(tmpSmileDegree);
		console.log('set smile degree', tmpSmileDegree);
		setSmileDegree(tmpSmileDegree);
	};

	const startPrediction = () => {
		console.log('startPrediction');
		setPredictionStatus(CalibrationStatus.DOING);
		smileDegrees = [];
	};

	const stopPrediction = () => {
		console.log('endPrediction');

		if (!faceLandmarker || !video) return;

		// TODO send this value to recommender
		const predictedSmileDegree = smileDegrees.reduce((acc, num) => acc + num, 0) / smileDegrees.length;
		console.log('final average smile degree predicted', predictedSmileDegree);
		setCalibrationStatus(CalibrationStatus.DONE);
		return predictedSmileDegree;
		// video.removeEventListener('loadeddata', endPrediction);
	};

	const predictWebcam = useCallback(() => {
		console.log('predictWebcam', faceLandmarkerService.faceLandmarker, video);
		if (!faceLandmarkerService.faceLandmarker || !video) return;
		let startTimeMs = performance.now();
		let results: FaceLandmarkerResult | null = null;

		if (lastVideoTime !== video.currentTime) {
			lastVideoTime = video.currentTime;
			results = faceLandmarkerService.faceLandmarker.detectForVideo(video, startTimeMs);
		}
		console.log(results);
		if (results && results.faceBlendshapes?.length > 0) {
			const { faceBlendshapes } = results;
			updateBlendValues(faceBlendshapes);
		}

		predictWebcam();
	}, []);

	const activateWebcamStream = (callback: () => void) => {
		console.log('activateWebcamStream', video);
		if (video === null) {
			console.log('Wait! video not loaded yet.');
			return;
		}

		// getUsermedia parameters.
		const constraints = {
			video: true,
		};
		// Activate the webcam stream.
		navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
			video.srcObject = stream;
			video.addEventListener('loadeddata', callback);
		});
	};

	// ************ UseEffects ************

	useEffect(() => {
		if (calibrationStatus === CalibrationStatus.DOING && !calibartionStarted) {
			calibartionStarted = true;
			calibrateRequestRef.current = requestAnimationFrame(doCalibration);
		}
	}, [calibrationStatus, doCalibration]);

	useEffect(() => {
		console.log('here', predictionStatus);
		if (predictionStatus === CalibrationStatus.DOING) {
			predictRequestRef.current = requestAnimationFrame(predictWebcam);
		}
	}, [predictionStatus, predictWebcam]);

	useEffect(() => {
		if (!video) return;

		initFacelandmarks();

		return () => {
			calibrateRequestRef.current && cancelAnimationFrame(calibrateRequestRef.current);
			predictRequestRef.current && cancelAnimationFrame(predictRequestRef.current);
		};
	}, [initFacelandmarks, video]);

	return {
		calibrationStatus: calibrationStatus,
		webcamRunning: webcamRunning,
		webcamEnabled: webcamEnabled,
		mood: mood,
		smileDegree: smileDegree,
		isInitialized: isInitialized,
		startCalibration: startCalibration,
		stopCalibration: stopCalibration,
		activateWebcamStream: activateWebcamStream,
		startPrediction: startPrediction,
		stopPrediction: stopPrediction,
		setVideoNode: (video: HTMLVideoElement) => setVideo(video),
	};
};
