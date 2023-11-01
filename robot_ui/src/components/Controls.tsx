type Props = {
    onNextClick: () => void
    onRandomClick: () => void
}
const Controls: React.FC<Props> = ({onNextClick, onRandomClick}) => {
    return (
        <div className="controls">
            <button className="btn">Play/Pause</button>
            <button className="btn" onClick={onNextClick}>Next</button>
            <button className="btn" onClick={onRandomClick}>Random</button>
        </div>
    )
}

export default Controls;