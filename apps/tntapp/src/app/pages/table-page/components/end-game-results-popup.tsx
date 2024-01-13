interface EndGameResultsPopupProps {
  onClose: () => void;
  teamWonRound: string;
  winningTeamPoints: number;
  finalStakeCount: number;
  teamAStakeCount: number;
  teamBStakeCount: number;
}

export function EndGameResultsPopup(props: EndGameResultsPopupProps) {
  return (
    <div className="resultsPopup" style={{ zIndex: 101 }}>
      <div className="resultsBox">
        <button className="closeButton" onClick={props.onClose}>
          X
        </button>
        <h2>GAME FINISHED</h2>
        <p>
          Game-winning Team!:{' '}
          <span className="dynamicData"> {props.teamWonRound}</span>{' '}
        </p>
        <p>
          Points Collected:{' '}
          <span className="dynamicData">{props.winningTeamPoints}</span>
        </p>
        <p>
          Stakes to HIT:{' '}
          <span className="dynamicData">{props.finalStakeCount}</span>
        </p>
        <p>
          Team A stake number:{' '}
          <span className="dynamicData">{props.teamAStakeCount}</span>
        </p>
        <p>
          Team B stake number:{' '}
          <span className="dynamicData">{props.teamBStakeCount}</span>
        </p>
      </div>
    </div>
  );
}
