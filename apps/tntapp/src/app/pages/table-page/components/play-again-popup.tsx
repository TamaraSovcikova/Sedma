interface PlayAgainPopupProps {
  onPlay: () => void;
  onLeave: () => void;
}

export function PlayAgainPopup(props: PlayAgainPopupProps) {
  return (
    <div className="resultsPopup">
      <div className="resultsBox" style={{ minHeight: '220px' }}>
        <h2>Do you wish to stay and play another game?</h2>
        <div className="button-container">
          <button className="button play-button" onClick={props.onPlay}>
            Lets Play!
          </button>
          <button className="button leave-button" onClick={props.onLeave}>
            Leave
          </button>
        </div>
      </div>
    </div>
  );
}
