import { useCallback, useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FaceLandmarkerResult } from '@mediapipe/tasks-vision';
import { FaceLandmarkerBlendValues } from '@/types/FaceLandmarkerBlendValues';
import { CalibrationStatus } from '@/types/CalibrationStatus';
import { initialBlendValues, useApplicationStore, useCalibrationStore } from '@/store/store';
import { faceLandmarkerService } from './faceLandMarkerService';
import { CalibrationMode } from '@/types/CalibrationMode';

interface FaceLandmarkDetectorType {
	calibrationStatus: CalibrationStatus;
	webcamRunning: boolean;
	webcamEnabled: boolean;
	smileDegree: number;
	isInitialized: boolean;
	startCalibration: () => void;
	stopCalibration: () => void;
	startPrediction: () => void;
	stopPrediction: () => number | undefined;
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
	const setMaxSmileDegree = useApplicationStore((state) => state.setSmileDegree);
	const setErrorMessage = useApplicationStore((state) => state.setError);

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
		// if (!video) {
		// 	console.log('Wait! video not loaded yet.');
		// 	return;
		// }

		setCalibrationBlendValues({
			mouthSmileLeft: [],
			mouthSmileRight: [],
		});
		setCalibrationStatus(CalibrationStatus.DOING);
	}, []);

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
		}

		// just retry in case results are array with length 0
		while (!results || results.faceBlendshapes.length === 0) {
			setErrorMessage("Calibration failed. Couldn't detect face. Trying again.");
			results = faceLandmarkerService.faceLandmarker.detectForVideo(video, startTimeMs);
		}
		setErrorMessage();

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
		setSmileDegree(tmpSmileDegree);
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

		console.log('final max smile degree predicted', currentMaxSmileDegree);
		predictionRunning = false;
		setMaxSmileDegree(currentMaxSmileDegree);
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
		} else {
			setErrorMessage("Prediction failed. Couldn't detect face. Please reload the page and try again.");
		}
	}, [video, calculateBlendValuesOnSpectrum]);

	// ************ UseEffects ************
	useEffect(() => {
		if (!isInitialized || !webcamEnabled || !webcamRunning) return;

		if (calibrationStatus === CalibrationStatus.DOING) {
			calibrateRequestRef.current = requestAnimationFrame(doCalibration);
		}
	}, [calibrationStatus, doCalibration, isInitialized]);

	useEffect(() => {
		setErrorMessage();

		if (!video) return;

		initFacelandmarks();

		return () => {
			calibrateRequestRef.current && cancelAnimationFrame(calibrateRequestRef.current);
			predictRequestRef.current && cancelAnimationFrame(predictRequestRef.current);
			predictionIntervalRef.current && clearInterval(predictionIntervalRef.current);
		};
	}, [initFacelandmarks, setErrorMessage, video]);

	return {
		calibrationStatus: calibrationStatus,
		webcamRunning: webcamRunning,
		webcamEnabled: webcamEnabled,
		smileDegree: smileDegree,
		isInitialized: isInitialized,
		startCalibration: startCalibration,
		stopCalibration: stopCalibration,
		startPrediction: startPrediction,
		stopPrediction: stopPrediction,
		setVideoNode: (video: HTMLVideoElement) => setVideo(video),
	};
};
