import { error } from 'console';
import { getTable } from '../lib/game';

export function createRoutes(app: any) {
  app.get('/api', (req, res) => {
    res.json({ message: 'Hello API' });
  });
  app.post('/api/table/Lobby', (req, res) => {
    const tableId = req.body.tableId;
    const table = getTable(tableId);
    if (table !== null) {
      const response = table.players.map((p) => p.name);
      res.json(response);
    } else res.send(404);
  });

  app.post('/table/:id', (req, res) => {
    const data = req.body;
    const params = req.params;
    const id = params.id;
    console.log(id);

    console.log('table recieved', data);
    switch (data.cmd) {
      case 'Play':
        //TODO const t = playCard(); // add data
        res.send();
        break;
    }

    res.send({ status: 'okey' }); //program play card
  });
  app.get('/table/:id', (req, res) => {
    const params = req.params;
    const id = params.id;
    console.log(id);
    //const table = getTable(id);
    //use the data from the table to set data

    const data = {
      players: ['Tim', 'Pim', 'Jim', 'Kim'],
      lastPlayedCards: [
        { suit: 'heart', face: 'seven' },
        { suit: 'heart', face: 'king' },
        { suit: 'acorn', face: 'eight' },
        { suit: 'bell', face: 'ace' },
      ],
      hand: [
        { suit: 'heart', face: 'seven' },
        { suit: 'heart', face: 'king' },
        { suit: 'acorn', face: 'eight' },
        { suit: 'bell', face: 'ace' },
      ],
    };
    res.send(data);
  });
}
