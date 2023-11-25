interface RoundResultsPopupProps {
  onClose: () => void;
  dealWinnerName: string | undefined;
  dealWinnerTeam: string | undefined;
  wonPoints: number;
  isLastRound: boolean;
}

export function RoundResultsPopup(props: RoundResultsPopupProps) {
  return (
    <div className="resultsPopup">
      <div className="resultsBox">
        <button className="closeButton" onClick={props.onClose}>
          X
        </button>
        <h2>Round Results</h2>
        <p>
          Deal winner :{' '}
          <span className="dynamicData">{props.dealWinnerName}</span>
        </p>
        <p>
          Their team:{' '}
          <span className="dynamicData">{props.dealWinnerTeam}</span>
        </p>
        <p>
          Points Collected:{' '}
          <span className="dynamicData">{props.wonPoints}</span>
        </p>
        {props.isLastRound && (
          <p className="lastDealBonus">
            Last deal bonus <span className="dynamicData2">10</span>
          </p>
        )}
      </div>
    </div>
  );
}
