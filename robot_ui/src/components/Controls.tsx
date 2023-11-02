type Props = {
    onNextClick: () => void
    onPlayClick: () => void
    onRandomClick: () => void
}
const Controls: React.FC<Props> = ({onNextClick, onPlayClick, onRandomClick}) => {
    return (
        <div className="controls">
            <button className="btn" onClick={onPlayClick}>Play/Stop</button>
            <button className="btn" onClick={onNextClick}>Next</button>
            <button className="btn" onClick={onRandomClick}>Random</button>
        </div>
    )
}

export default Controls;