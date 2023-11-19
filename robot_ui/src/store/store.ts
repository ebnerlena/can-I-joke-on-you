import { FaceLandmarkerBlendValues } from '@/types/FaceLandmarkerBlendValues';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Calibration Store

interface CalibrationStore {
	blendValues: FaceLandmarkerBlendValues | undefined;
	setBlendValues: (blendValues: FaceLandmarkerBlendValues) => void;

	reset: () => void;
}

export const useCalibrationStore = create<CalibrationStore>()(
	persist(
		(set) => ({
			blendValues: undefined,
			setBlendValues: (blendValues) => set(() => ({ blendValues: blendValues })),

			reset: () =>
				set(() => ({
					blendValues: undefined,
				})),
		}),
		{
			name: 'calibration-storage', // name of the item in the storage (must be unique)
		},
	),
);
