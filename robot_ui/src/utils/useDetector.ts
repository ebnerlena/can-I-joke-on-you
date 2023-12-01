import { useCallback, useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FaceLandmarkerResult } from '@mediapipe/tasks-vision';
import { FaceLandmarkerBlendValues } from '@/types/FaceLandmarkerBlendValues';
import { CalibrationStatus } from '@/types/CalibrationStatus';
import { Mood } from '@/types/Mood';
import { initialBlendValues, useCalibrationStore } from '@/store/store';
import { FaceLandmarkerService, faceLandmarkerService } from './faceLandMarkerService';
import { CalibrationMode } from '@/types/CalibrationMode';

interface FaceLandmarkDetectorType {
	calibrationStatus: CalibrationStatus;
	webcamRunning: boolean;
	webcamEnabled: boolean;
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
	mouthSmileLeft: number[];
	mouthSmileRight: number[];
};

const CALIBRATION_FRAMES = 30;
const PREDICTION_INTERVAL = 1000;

let lastVideoTime = -1;

let smileDegrees: number[] = Array(100).fill(0);
let currentMaxSmileDegree: number = 0;
let currentAvgSmileDegree: number = 0;

let lastSmileDegreeHeadIdx = 0;
let predictionRunning = false;

export const useFaceLandmarkDetector = (): FaceLandmarkDetectorType => {
	const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker>();
	const [isInitialized, setIsInitialized] = useState<boolean>(false);
	const [video, setVideo] = useState<HTMLVideoElement | null>(null);
	const [webcamRunning, setWebcamRunning] = useState<boolean>(false);
	const [webcamEnabled, setWebcamEnabled] = useState<boolean>(false);
	const [calibrationStatus, setCalibrationStatus] = useState<CalibrationStatus>(CalibrationStatus.NOT_READY);
	const [smileDegree, setSmileDegree] = useState<number>(0);
	const [calibrationBlendValues, setCalibrationBlendValues] = useState<DuringCalibrationBlendValues>({
		mouthSmileLeft: [],
		mouthSmileRight: [],
	});

	// Global Store
	const setBlendValuesFromCalibration = useCalibrationStore((state) => state.setBlendValues);
	const blendValuesFromCalibration = useCalibrationStore((state) => state.blendValues);
	const calibrationStatusFromStore = useCalibrationStore((state) => state.status);
	const smileBlendValuesFromCalibration = useCalibrationStore((state) => state.smileBlendValues);
	const setSmileBlendValuesFromCalibration = useCalibrationStore((state) => state.setSmileBlendValues);

	// Refs
	const calibrateRequestRef = useRef<number>();
	const predictRequestRef = useRef<number>();
	const predictionIntervalRef = useRef<NodeJS.Timeout>();

	const initFacelandmarks = useCallback(async () => {
		const landmarker = faceLandmarkerService.faceLandmarker;
		setFaceLandmarker(landmarker);
		setIsInitialized(true);

		if (isWebcamIsEnabled()) {
			setCalibrationStatus(CalibrationStatus.READY);
			setWebcamRunning(true);
			setWebcamEnabled(true);
		}
	}, []);

	const isWebcamIsEnabled = (): boolean => {
		return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
	};

	// ************************* Calibration *********************************

	const startCalibration = useCallback(() => {
		console.log('startCalibration');
		if (!video) {
			console.log('Wait! video not loaded yet.');
			return;
		}

		setCalibrationBlendValues({
			mouthSmileLeft: [],
			mouthSmileRight: [],
		});
		setCalibrationStatus(CalibrationStatus.DOING);
	}, [video]);

	const storeCalibrations = useCallback(async () => {
		console.log('storeCalibrations', calibrationBlendValues);

		const tmpBlendValues = { ...initialBlendValues };

		// use average of calibration values in store
		for (var key in calibrationBlendValues) {
			// @ts-ignore
			const values = calibrationBlendValues[key];
			// @ts-ignore
			tmpBlendValues[key] = values.reduce((acc: any, num: any) => acc + num, 0) / values.length;
		}

		// Distinguish between normal and smile calibration
		if (calibrationStatusFromStore === CalibrationMode.NEUTRAL) {
			setBlendValuesFromCalibration(tmpBlendValues);
		} else {
			setSmileBlendValuesFromCalibration(tmpBlendValues);
		}
	}, [
		calibrationBlendValues,
		calibrationStatusFromStore,
		setBlendValuesFromCalibration,
		setSmileBlendValuesFromCalibration,
	]);

	const stopCalibration = useCallback(() => {
		console.log('stopCalibration');

		setCalibrationStatus(CalibrationStatus.DONE);
		storeCalibrations();
		setVideo(null);
	}, [storeCalibrations]);

	const doCalibration = useCallback(async () => {
		// console.log('doCalibration', video, faceLandmarkerService.faceLandmarker);
		if (!faceLandmarkerService.faceLandmarker || !video) return;

		if (calibrationBlendValues.mouthSmileLeft.length >= CALIBRATION_FRAMES) {
			stopCalibration();
			return;
		}

		let startTimeMs = performance.now();
		let results: FaceLandmarkerResult | null = null;

		if (lastVideoTime !== video.currentTime) {
			lastVideoTime = video.currentTime;
			results = faceLandmarkerService.faceLandmarker.detectForVideo(video, startTimeMs);
			// console.log(results);
		}

		if (!results || results.faceBlendshapes.length === 0) return;

		const { faceBlendshapes } = results;

		const tmpBlendValues = calibrationBlendValues;

		for (var key in faceBlendshapes[0].categories) {
			var blendName = faceBlendshapes[0].categories[key].categoryName;
			var blendScore = faceBlendshapes[0].categories[key].score;

			if (tmpBlendValues.hasOwnProperty(blendName)) {
				// @ts-ignore
				tmpBlendValues[blendName].push(blendScore);
			}
		}
		setCalibrationBlendValues(tmpBlendValues);

		if (calibrationStatus === CalibrationStatus.DOING) {
			calibrateRequestRef.current = requestAnimationFrame(doCalibration);
		}
	}, [calibrationBlendValues, calibrationStatus, stopCalibration, video]);

	// *********************************** Prediction **************************************

	const calculateBlendValuesOnSpectrum = useCallback(
		(faceBlendshapes: any) => {
			// console.log('calculateBlendValuesOnSpectrum', faceBlendshapes);
			let blendFactors: FaceLandmarkerBlendValues = {
				mouthSmileLeft: 0,
				mouthSmileRight: 0,
			};

			for (const key in faceBlendshapes[0].categories) {
				let blendName = faceBlendshapes[0].categories[key].categoryName;
				let blendScore = faceBlendshapes[0].categories[key].score;

				if (blendName in blendFactors && blendValuesFromCalibration.hasOwnProperty(blendName)) {
					// @ts-ignore
					blendFactors[blendName] += // @ts-ignore
						blendScore / (smileBlendValuesFromCalibration[blendName] - blendValuesFromCalibration[blendName]);
				}
			}

			calculateSmileDegree(blendFactors);
		},
		[blendValuesFromCalibration, smileBlendValuesFromCalibration],
	);

	const calculateSmileDegree = (blendValues: FaceLandmarkerBlendValues) => {
		// console.log('calculateSmileDegree');
		// Calculate smile degree
		let tmpSmileDegree = blendValues['mouthSmileLeft'] + blendValues['mouthSmileRight'] / 2;
		tmpSmileDegree = Math.min(1, Math.max(0, tmpSmileDegree));

		// Pushing smileDegree to shifting array
		smileDegrees[lastSmileDegreeHeadIdx] = tmpSmileDegree;
		lastSmileDegreeHeadIdx += 1 % smileDegrees.length;

		// Update average and max smile degree
		const tmpAvgSmileDegree = smileDegrees.reduce((acc, num) => acc + num, 0) / smileDegrees.length;
		if (tmpAvgSmileDegree > currentMaxSmileDegree) {
			currentAvgSmileDegree = tmpAvgSmileDegree;
			currentMaxSmileDegree = Math.max(...smileDegrees);
		}

		console.log('set smile degree: ', tmpSmileDegree);
	};

	const startPrediction = () => {
		console.log('startPrediction');
		predictionRunning = true;
		smileDegrees = Array(100).fill(0);
		currentMaxSmileDegree = 0;
		currentAvgSmileDegree = 0;

		predictRequestRef.current = requestAnimationFrame(predictWebcam);

		predictionIntervalRef.current = setInterval(
			() => (predictRequestRef.current = requestAnimationFrame(predictWebcam)),
			PREDICTION_INTERVAL,
		);
	};

	const stopPrediction = () => {
		console.log('stopPrediction');
		if (!faceLandmarkerService.faceLandmarker || !video) return;

		// TODO send max value to recommender - can be used from store as it is stored globally
		console.log('final max smile degree predicted', currentMaxSmileDegree);
		predictionRunning = false;
		setSmileDegree(currentMaxSmileDegree);
		clearInterval(predictionIntervalRef.current);

		return currentMaxSmileDegree;
	};

	const predictWebcam = useCallback(() => {
		// console.log('predictWebcam', faceLandmarkerService.faceLandmarker, video, predictionRunning);
		if (!predictionRunning) return;

		if (!faceLandmarkerService.faceLandmarker || !video) return;
		let startTimeMs = performance.now();
		let results: FaceLandmarkerResult | null = null;

		if (lastVideoTime !== video.currentTime) {
			lastVideoTime = video.currentTime;
			results = faceLandmarkerService.faceLandmarker.detectForVideo(video, startTimeMs);
		}
		if (results && results.faceBlendshapes?.length > 0) {
			const { faceBlendshapes } = results;
			calculateBlendValuesOnSpectrum(faceBlendshapes);
		}
	}, [video, calculateBlendValuesOnSpectrum]);

	const activateWebcamStream = useCallback(
		(callback: () => void) => {
			console.log('activateWebcamStream');
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
		},
		[video],
	);

	// ************ UseEffects ************
	useEffect(() => {
		if (calibrationStatus === CalibrationStatus.DOING) {
			calibrateRequestRef.current = requestAnimationFrame(doCalibration);
		}
	}, [calibrationStatus, doCalibration]);

	useEffect(() => {
		if (!video) return;

		initFacelandmarks();

		return () => {
			calibrateRequestRef.current && cancelAnimationFrame(calibrateRequestRef.current);
			predictRequestRef.current && cancelAnimationFrame(predictRequestRef.current);
			predictionIntervalRef.current && clearInterval(predictionIntervalRef.current);
		};
	}, [initFacelandmarks, video]);

	return {
		calibrationStatus: calibrationStatus,
		webcamRunning: webcamRunning,
		webcamEnabled: webcamEnabled,
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
