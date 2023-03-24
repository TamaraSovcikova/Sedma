import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function InitialPage() {
  const [tableID, setTableID] = useState<string>();
  const navigate = useNavigate();
  console.log(tableID);
  return (
    <div>
      <button>Create Table</button>
      <input
        placeholder="Enter ID"
        value={tableID}
        onChange={(e) => setTableID(e.target.value)}
      ></input>
      <button onClick={() => navigate('/table')}>Join Table</button>
    </div>
  );
}
