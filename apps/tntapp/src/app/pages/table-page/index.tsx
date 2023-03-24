import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getGlobal } from '../../global';
import { fetchData } from '../../lib/api';
import { Card } from '../../types';

interface TableData {
  players: string[];
  hand: Card[];
}
export function TablePage() {
  const params = useParams();
  const id = params.id;

  const [data, setData] = useState<TableData>();
  console.log('data', data);

  useEffect(() => {
    if (id) fetchData(getGlobal().tableUrl(id)).then((d) => setData(d));
  }, [id]);
  return (
    <div>
      {data?.players.map((p) => p)}

      <p>table page {id}</p>
    </div>
  );
} //write everything we need to write table css,html
//array hand
