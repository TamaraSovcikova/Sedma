import { randomUUID } from 'crypto';
import { createTable, getTable } from '../lib/game';
import { addPlayer } from '../lib/table';
import debugLog from 'debug';

const debug = debugLog('routes');

function extractAuth(req, res, next) {
  const token = req.get('authorization');
  debug('token', token);
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
    debug('found table: ', table);
    if (table !== null) {
      const response = table.players.map((p) => p.name);
      res.json(response);
    } else res.status(404).send('not found');
  });
  app.post('/table/Lobby/:id', (req, res) => {
    const data = req.body;
    const params = req.params;
    const tableId = params.id;
    const { username, seatId } = data;
    const table = getTable(tableId);
    const player = addPlayer(username, table, seatId - 1);
    debug('adding player to table: ', table, getTable(tableId));

    res.status(200).json({ id: player.id });
  });

  app.post('/table/new', (req, res) => {
    //create table
    const newTableID = randomUUID();
    createTable(newTableID);
    res.json(newTableID);

    debug(`Created new table}`);
  });

  app.post('/table/:id', (req, res) => {
    const data = req.body;
    const params = req.params;
    const id = params.id;
    debug(id);

    debug('table recieved', data);
    switch (data.cmd) {
      case 'Play':
        //TODO const t = playCard(); // add data
        res.send();
        break;
    }

    res.send({ status: 'okey' }); //program play card
  });
  //TODO: to be removed to implement websockets
  app.get('/table/:id', (req, res) => {
    const params = req.params;
    const id = params.id;

    debug('req.user:', req.user);
    const userId = req.user.id;
    const table = getTable(id);
    debug('fetching this table:', table, id);
    const players = table.players.map((p) => ({ name: p.name, id: p.id }));
    const lastPlayedCards = table.players.map((p) => p.lastPlayedCard);
    debug('table:', table, userId);
    const player = table.players.find((p) => p.id == userId);
    const hand = player.onHand;
    const data = { players, lastPlayedCards, hand };
    debug('table data:', data);

    res.send(data);
  });
}
