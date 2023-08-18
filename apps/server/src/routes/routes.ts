import { getTable } from '../lib/game';
import { addPlayer } from '../lib/table';

function extractAuth(req, res, next) {
  const token = req.get('authorization');
  console.log('token', token);
  req.user = { id: token };
  next();
}

export function createRoutes(app: any) {
  app.use(extractAuth); //middlewere

  app.get('/api', (req, res) => {
    res.json({ message: 'Hello API' });
  });
  app.get('/table/Lobby/:id', (req, res) => {
    const params = req.params;
    const tableId = params.id;
    const table = getTable(tableId);
    console.log('found table: ', table);
    if (table !== null) {
      const response = table.players.map((p) => p.name);
      res.json(response);
    } else res.status(404);
  });
  app.post('/table/Lobby/:id', (req, res) => {
    const data = req.body;
    const params = req.params;
    const tableId = params.id;
    const { username, seatId } = data;
    const table = getTable(tableId);
    const player = addPlayer(username, table, seatId - 1);
    res.status(200).json({ id: player.id });
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
    ('');
    const userId = req.user.token;
    const table = getTable(id);
    const players = table.players.map((p) => p.name);
    const lastPlayedCards = table.players.map((p) => p.lastPlayedCard);

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
