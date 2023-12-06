import StartScreen from '@/components/StartScreen';

export default function Home() {
	// const applicationStatus = useApplicationStore((state) => state.status);

	// switch (applicationStatus) {
	// 	case ApplicationStatus.START:
	return <StartScreen />;
	// 	case ApplicationStatus.CALIBRATION:
	// 		return <CalibrationScreen />;
	// 	case ApplicationStatus.MAIN:
	// 		return <PlayJokes />;
	// 	case ApplicationStatus.END:
	// 		return <EndScreen />;
	// 	default:
	// 		return <>not implemented</>;
	// }
}
