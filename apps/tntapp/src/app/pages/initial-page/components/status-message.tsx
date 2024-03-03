import { ReactEventHandler } from 'react';

interface StatusMessageProps {
  message: string;
  onReturn: ReactEventHandler | null;
  onLeave: ReactEventHandler;
  returnColor?: string;
  leaveColor?: string;
}

export function StatusMessage({
  message,
  onReturn,
  onLeave,
  returnColor = 'darkgreen',
  leaveColor = 'gray',
}: StatusMessageProps) {
  return (
    <div>
      <p style={{ color: 'darkred' }}>{message}</p>
      {onReturn && (
        <button
          className="btn btn-secondary"
          style={{ background: returnColor, marginRight: '10px' }}
          onClick={onReturn}
        >
          Return to Game
        </button>
      )}
      <button
        className="btn btn-secondary"
        style={{ background: leaveColor }}
        onClick={onLeave}
      >
        Leave Game
      </button>
    </div>
  );
}
