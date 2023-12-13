'use client';

import { useEffect, useState } from 'react';

type Props = {
	isMuted: boolean;
	isPlaying: boolean;
	onNextClick: () => void;
	onPlayClick: () => void;
	onMuteClick: () => void;
};
const Controls: React.FC<Props> = ({ onNextClick, onPlayClick, onMuteClick, isMuted, isPlaying }) => {
	const [ttsAvailable, setTtsAvailable] = useState<boolean>(false);

	useEffect(() => {
		const voices = window.speechSynthesis.getVoices();
		if (window.speechSynthesis && voices.length > 0) {
			setTtsAvailable(true);
		}
	}, []);

	return (
		<div className="flex flex-col gap-2 absolute top-[170px] right-4 z-10 w-44">
			<button className="btn w-full" onClick={onNextClick}>
				⏩ NEXT JOKE
			</button>

			<button className="btn w-full" onClick={onPlayClick} disabled={!ttsAvailable || isMuted}>
				{isPlaying ? '🛑 STOP' : '▶️ TELL ME JOKE'}
			</button>

			<button className="btn w-full" onClick={onMuteClick} disabled={!ttsAvailable}>
				{!isMuted ? '🔇 MUTE' : '🔊 UNMUTE'}
			</button>
		</div>
	);
};

export default Controls;
