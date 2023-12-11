import { ApplicationStatus } from '@/types/ApplicationStatus';
import { CalibrationMode } from '@/types/CalibrationMode';
import { FaceLandmarkerBlendValues } from '@/types/FaceLandmarkerBlendValues';
import { STUDY_ROUND } from '@/types/StudyRound';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Calibration Store
export const initialBlendValues = {
	mouthSmileLeft: 0,
	mouthSmileRight: 0,
};
interface CalibrationStore {
	blendValues: FaceLandmarkerBlendValues;
	setBlendValues: (blendValues: FaceLandmarkerBlendValues) => void;
	smileBlendValues: FaceLandmarkerBlendValues;
	setSmileBlendValues: (smileBlendValues: FaceLandmarkerBlendValues) => void;
	status: CalibrationMode; // 0 = normal calibration, 1 = smile calibration
	setStatus: (status: CalibrationMode) => void;

	reset: () => void;
}

export const useCalibrationStore = create<CalibrationStore>()(
	persist(
		(set) => ({
			blendValues: initialBlendValues,
			setBlendValues: (blendValues) => set(() => ({ blendValues: blendValues })),
			smileBlendValues: initialBlendValues,
			setSmileBlendValues: (smileBlendValues) => set(() => ({ smileBlendValues: smileBlendValues })),
			status: 0,
			setStatus: (status) => set(() => ({ status: status })),

			reset: () =>
				set(() => ({
					blendValues: initialBlendValues,
					smileBlendValues: initialBlendValues,
					status: CalibrationMode.NEUTRAL,
				})),
		}),
		{
			name: 'calibration-storage', // name of the item in the storage (must be unique)
		},
	),
);

interface ApplicationStore {
	status: ApplicationStatus;
	setStatus: (status: ApplicationStatus) => void;
	smileDegree: number;
	setSmileDegree: (smileDegree: number) => void;
	uuid?: string;
	setUUID: (uuid?: string) => void;
	studyRound: STUDY_ROUND;
	setStudyRound: (studyRound: STUDY_ROUND) => void;
	predictionPageReloaded: boolean;
	setPredictionPageReloaded: (predictionPageReloaded: boolean) => void;

	reset: () => void;
}

export const useApplicationStore = create<ApplicationStore>()(
	persist(
		(set) => ({
			status: ApplicationStatus.START,
			setStatus: (status) => set(() => ({ status: status })),
			smileDegree: 0,
			setSmileDegree: (smileDegree) => set(() => ({ smileDegree: smileDegree })),
			studyRound: STUDY_ROUND.A,
			setStudyRound: (studyRound) => set(() => ({ studyRound: studyRound })),
			uuid: undefined,
			setUUID: (uuid) => set(() => ({ uuid: uuid })),
			predictionPageReloaded: false,
			setPredictionPageReloaded: (predictionPageReloaded) =>
				set(() => ({ predictionPageReloaded: predictionPageReloaded })),

			reset: () =>
				set(() => ({
					status: ApplicationStatus.START,
					smileDegree: 0,
					predictionPageReloaded: false,
				})),
		}),
		{
			name: 'app-storage', // name of the item in the storage (must be unique)
		},
	),
);

interface UserStore {
	uuid?: string;
	setUUID: (uuid?: string) => void;
	studyRound: STUDY_ROUND;
	setStudyRound: (studyRound: STUDY_ROUND) => void;

	reset: () => void;
}

export const useUserStore = create<UserStore>()(
	persist(
		(set) => ({
			studyRound: STUDY_ROUND.A,
			setStudyRound: (studyRound) => set(() => ({ studyRound: studyRound })),
			uuid: undefined,
			setUUID: (uuid) => set(() => ({ uuid: uuid })),

			reset: () =>
				set(() => ({
					studyRound: STUDY_ROUND.A,
					uuid: undefined,
				})),
		}),
		{
			name: 'user-storage', // name of the item in the storage (must be unique)
		},
	),
);
