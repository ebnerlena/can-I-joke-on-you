'use client';

type Props = {
	isMuted: boolean;
	isPlaying: boolean;
	onNextClick: () => void;
	onPlayClick: () => void;
	onMuteClick: () => void;
};
const Controls: React.FC<Props> = ({ onNextClick, onPlayClick, onMuteClick, isMuted, isPlaying }) => {
	return (
		<div className="flex flex-col gap-2 absolute top-[170px] right-4 z-10 w-44">
			<button className="btn w-full" onClick={onNextClick}>
				⏩ NEXT JOKE
			</button>

			<button className="btn w-full" onClick={onPlayClick}>
				{isPlaying ? '🛑 STOP' : '▶️ TELL ME JOKE'}
			</button>

			<button className="btn w-full" onClick={onMuteClick}>
				{!isMuted ? '🔇 MUTE' : '🔊 UNMUTE'}
			</button>
		</div>
	);
};

export default Controls;
