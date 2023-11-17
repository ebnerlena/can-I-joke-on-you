type Props = {
	onNextClick: () => void;
	onPlayClick: () => void;
	onRandomClick: () => void;
};
const Controls: React.FC<Props> = ({ onNextClick, onPlayClick, onRandomClick }) => {
	return (
		<div className="flex flex-col gap-1 absolute top-[170px] right-4 z-10">
			<button className="btn" onClick={onPlayClick}>
				Play/Stop
			</button>
			<button className="btn" onClick={onNextClick}>
				Next
			</button>
			<button className="btn" onClick={onRandomClick}>
				Random
			</button>
		</div>
	);
};

export default Controls;
