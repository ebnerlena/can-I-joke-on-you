import { ApplicationStatus } from '@/types/ApplicationStatus';
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

	reset: () => void;
}

export const useCalibrationStore = create<CalibrationStore>()(
	persist(
		(set) => ({
			blendValues: initialBlendValues,
			setBlendValues: (blendValues) => set(() => ({ blendValues: blendValues })),

			reset: () =>
				set(() => ({
					blendValues: initialBlendValues,
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
