'use client';

import Webcam from 'react-webcam';

const StartScreen = () => {
	const inputResolution = {
		width: 1080 / 2,
		height: 900 / 2,
	};

	const videoConstraints = {
		width: inputResolution.width,
		height: inputResolution.height,
		facingMode: 'user',
	};

	return (
		<div className="h-full w-full flex flex-col items-center justify-center gap-8 p-12">
			<div className="text-justify text-xl max-w-[800px]">
				<h2 className="font-bold pb-2">Welcome!</h2>
				<p>Before you can start we do a short calibration of your face. </p>
				<p>Please make sure your face is fully covered by your camera.</p>
				<p>Additionally we ask you to keep a neutral face while calibrating.</p>
				<p className="pt-8">Press START CALIBRATION whenever you are ready.</p>
			</div>

			<button className="btn text-3xl">Start Calibration</button>

			<Webcam videoConstraints={videoConstraints} />
		</div>
	);
};

export default StartScreen;
