'use client';

import Link from 'next/link';
import Webcam from 'react-webcam';
import Image from 'next/image';

const StartScreen = () => {
	const inputResolution = {
		width: 1080 / 3,
		height: 900 / 3,
	};

	const videoConstraints = {
		width: inputResolution.width,
		height: inputResolution.height,
		facingMode: 'user',
	};

	return (
		<div className="h-full w-full flex flex-col items-center justify-center gap-8 p-12">
			<div className="flex flex-col items-center gap-16 w-full justify-center">
				<div className="flex flex-col gap-4">
					<div className="text-justify text-xl max-w-[1000px]">
						<h2 className="font-bold pb-2 text-2xl">Calibration Phase:</h2>
						<p>Before you can start we do a short calibration of your face. </p>
						<p>Please make sure your face is fully covered by your camera.</p>
						<p>
							Additionally we ask you to keep a <span className="font-bold">NEUTRAL</span> face while calibrating.
						</p>
						<p className="pt-8">
							Press <span className="font-bold">START NEUTRAL CALIBRATION</span> whenever you are ready.
						</p>
					</div>
					<Link href="/calibration" className="btn text-3xl w-fit self-center">
						Start NEUTRAL Calibration
					</Link>
				</div>
				<div className="flex gap-10">
					<div className="w-62 h-62">
						<Image src={'/images/neutralTeams.png'} alt="neutral" width={200} height={200} className="w-full h-full" />
					</div>
					<Webcam videoConstraints={videoConstraints} />
				</div>
			</div>
		</div>
	);
};

export default StartScreen;
