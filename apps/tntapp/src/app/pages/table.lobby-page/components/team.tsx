import { Seat } from '../table.lobby-page';

interface TeamProps {
  teamName: string;
  seats: Seat[];
  selectedSeatId: number | null;
  onSeatClick: (seatId: number) => void;
}

export const Team: React.FC<TeamProps> = ({
  teamName,
  seats,
  selectedSeatId,
  onSeatClick,
}) => (
  <div className="team">
    <h3 className="lobby-sub-header">{teamName}</h3>
    <div className="row">
      {seats.map((seat) => (
        <div
          key={seat.id}
          className={`seat ${seat.taken ? 'taken' : ''} ${
            selectedSeatId === seat.id ? 'selected' : ''
          }`}
          onClick={() => !seat.taken && onSeatClick(seat.id)}
        >
          {seat.taken ? seat.name : 'Available'}
        </div>
      ))}
    </div>
  </div>
);
