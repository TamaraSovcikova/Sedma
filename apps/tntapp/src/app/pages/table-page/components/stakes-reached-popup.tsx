interface StakesReachedPopupProps {
  onClose: () => void;
  winningTeam: string | undefined;
  winningStakeCount: number | undefined;
  finalStakeCount: number;
}

export function StakesReachedPopup(props: StakesReachedPopupProps) {
  return (
    <div className="resultsPopup" style={{ zIndex: 102 }}>
      <div className="resultsBox">
        <button className="closeButton" onClick={props.onClose}>
          X
        </button>
        <h2>CONGRATS!</h2>
        <h5>Game has finished!</h5>
        <p>
          Team who won the game!:{' '}
          <span className="dynamicData"> {props.winningTeam}</span>{' '}
        </p>
        <p>
          Their stake count :{' '}
          <span className="dynamicData">{props.winningStakeCount}</span>
        </p>
        <p>
          Stakes to HIT:{' '}
          <span className="dynamicData">{props.finalStakeCount}</span>
        </p>
      </div>
    </div>
  );
}
