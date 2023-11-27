'use client';

import Link from 'next/link';
import Webcam from 'react-webcam';
import Image from 'next/image';

const StartSmileCalibrationScreen = () => {
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
			<div className='flex gap-16'>
				<Image src={"/smileTeams.png"} alt='smile' width={200} height={200}></Image>
				<div className='flex flex-col gap-4'>
					<div className="text-justify text-xl max-w-[800px]">
						<h2 className="font-bold pb-2">Give us your biggest smile :)</h2>
						<p>As last step we need your biggest smile for calibrating your face. </p>
						<p>Again please make sure your face is fully covered by your camera.</p>
						<p>
							Additionally we ask you to keep <span className="font-bold">SMILING</span> as big as you can while
							calibrating.
						</p>
						<p className="pt-8">
							Press <span className="font-bold">START SMILE CALIBRATION</span> whenever you are ready.
						</p>
					</div>

					<Link href="/smile-calibration" className="btn text-3xl w-fit">
						Start Smile Calibration
					</Link>
				</div>
			</div>
			<Webcam videoConstraints={videoConstraints} />
		</div>
	);
};

export default StartSmileCalibrationScreen;
