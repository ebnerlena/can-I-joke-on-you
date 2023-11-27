import { ApplicationStatus } from '@/types/ApplicationStatus';
import { CalibrationMode } from '@/types/CalibrationMode';
import { FaceLandmarkerBlendValues } from '@/types/FaceLandmarkerBlendValues';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Calibration Store
export const initialBlendValues = {
	mouthPressLeft: 0,
	mouthPressRight: 0,
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
}

export const useApplicationStore = create<ApplicationStore>()((set) => ({
	status: ApplicationStatus.START,
	setStatus: (status) => set(() => ({ status: status })),
}));
