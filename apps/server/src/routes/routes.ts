import { randomUUID } from 'crypto';
import { createTable, getTable } from '../lib/game';
import { addPlayer } from '../lib/table';
import debugLog from 'debug';
import { computerLevel1 } from '../lib/computerPlayer1';

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
  app.post('/table/newSinglePlayer', (req, res) => {
    debug('Creating new Single player table');
    const newTableID = randomUUID();
    const table = createTable(newTableID);

    const p1 = addPlayer(req.body.name, table, 0);
    const p2 = addPlayer('Player 2', table, 1);
    const p3 = addPlayer('Player 3', table, 2);
    const p4 = addPlayer('Player 4', table, 3);

    p2.setAutoPlay(computerLevel1);
    p2.connectPlayer(null);
    p3.setAutoPlay(computerLevel1);
    p3.connectPlayer(null);
    p4.setAutoPlay(computerLevel1);
    p4.connectPlayer(null);

    debug('Created new SinglePlayer table:', table);
    res.json({ tableId: newTableID, playerId: p1.id });
  });

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
