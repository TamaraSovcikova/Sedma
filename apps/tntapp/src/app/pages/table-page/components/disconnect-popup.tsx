interface DisconnectPopupProps {
  onResume: () => void;
  onLeave: () => void;
  isOwner: boolean;
}

export function DisconnectPopup(props: DisconnectPopupProps) {
  return (
    <div className="resultsPopup">
      <div className="resultsBox">
        <h2>Are you sure you want to leave?</h2>
        {props.isOwner && (
          <p
            style={{
              fontSize: '15px',
              color: 'red',
            }}
          >
            WARNING: Table will be deleted!
          </p>
        )}
        <div className="button-container">
          <button className="button play-button" onClick={props.onResume}>
            Back
          </button>
          <button className="button leave-button" onClick={props.onLeave}>
            Leave
          </button>
        </div>
      </div>
    </div>
  );
}
