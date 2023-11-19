import CalibrationScreen from '@/components/CalibrationScreen';
import PlayJokes from '@/components/PlayJokes';
import StartScreen from '@/components/StartScreen';
import { faceLandmarkerService } from '@/utils/faceLandMarkerService';

export default function Home() {
	const landmarker = faceLandmarkerService.faceLandmarker;

	return <CalibrationScreen />;
	return <StartScreen />;
	return <PlayJokes />;
}
