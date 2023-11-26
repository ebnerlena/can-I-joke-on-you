'use client';

import CalibrationScreen from '@/components/CalibrationScreen';
import EndScreen from '@/components/EndSreen';
import PlayJokes from '@/components/PlayJokes';
import StartScreen from '@/components/StartScreen';
import { useApplicationStore } from '@/store/store';
import { ApplicationStatus } from '@/types/ApplicationStatus';

export default function Home() {
	const applicationStatus = useApplicationStore((state) => state.status);

	switch (applicationStatus) {
		case ApplicationStatus.START:
			return <StartScreen />;
		case ApplicationStatus.CALIBRATION:
			return <CalibrationScreen />;
		case ApplicationStatus.MAIN:
			return <PlayJokes />;
		case ApplicationStatus.END:
			return <EndScreen />;
		default:
			return <>not implemented</>;
	}
}
