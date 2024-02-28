import { createTable, deleteTable, getTable } from '../lib/game';
import { addPlayer, deletePlayer } from '../lib/table';
import debugLog from 'debug';
import { computerLevel1 } from '../lib/computerPlayer1';
import expressWs from 'express-ws';
import { handleWs } from '../lib/wsServer';
import { v4 as uuidv4 } from 'uuid';

const debug = debugLog('routes');

const generateUUID = () => uuidv4().slice(0, 8); // Function to generate UUID

// Middleware to extract authorization token from request header
function extractAuth(req, res, next) {
  const token = req.get('authorization'); // Extracting token from request header
  debug('token', token);
  req.user = { id: token };
  next(); // Calling next middleware
}

// Function to create routes for the application
export function createRoutes(app: any) {
  app.use(extractAuth); // Using authorization extraction middleware
  expressWs(app); // Adding WebSocket support to Express

  app.ws('/', (ws, req) => handleWs(ws)); // Handling WebSocket connections at root

  app.get('/api', (res) => {
    // Handling GET request to '/api' endpoint
    res.json({ message: 'Hello API' }); // Sending JSON response
  });

  // POST route to delete a player from a table
  app.post('/table/deletePlayer/:id', (req, res) => {
    // Handling delete player request
    // Extracting data and parameters from request
    const data = req.body;
    const params = req.params;
    const tableId = params.id;
    const { oldUsername } = data;
    const table = getTable(tableId); // Retrieving table based on ID
    const oldPlayer = table.players.find((p) => p.name === oldUsername);

    const seatPosition: number = table.players.indexOf(oldPlayer);
    deletePlayer(oldPlayer, table, seatPosition); // Deleting player from table

    res.sendStatus(200); // Sending success status
  });

  // POST route to check if a username is available
  app.post('/table/newUsername/:id', (req, res) => {
    // Handling new username availability check request
    const params = req.params;
    const tableId = params.id;
    const { username } = req.body;
    const table = getTable(tableId);

    const isUsernameTaken = table.players.find(
      (p) => p.name === username && p.name !== ''
    );

    if (isUsernameTaken) {
      res.status(404).json({ message: 'Username is taken' });
    } else {
      res.status(200).json({ message: 'Username is free' });
    }
  });

  // GET route to retrieve lobby players of a table
  app.get('/table/Lobby/:id', (req, res) => {
    // Handling request to fetch lobby players
    const params = req.params;
    const tableId = params.id;
    const table = getTable(tableId);
    debug('found table: ', table);
    if (table !== null) {
      const response = table.players.map((p) => p.name); // Extracting player names
      res.json(response); // Sending JSON response
    } else res.status(404).send('not found'); // Sending 404 if table not found
  });

  // GET route to check if a table exists
  app.get('/table/exists/:id', (req, res) => {
    const params = req.params;
    const tableId = params.id;

    const existingTableId = getTable(tableId).id;

    if (existingTableId === tableId) {
      // Checking if table exists
      res.status(200).json({ message: 'Table found' }); // Sending success response
    } else {
      res.status(404).json({ message: 'Table not found' }); // Sending error response
    }
  });

  // POST route to log out a player from a table
  app.post('/table/loggout/:id', (req, res) => {
    const data = req.body;
    const params = req.params;
    const tableId = params.id;
    const { token } = data;
    const table = getTable(tableId);
    const player = table.players.find((p) => p.id === token);

    const seatPosition: number = table.players.indexOf(player);
    deletePlayer(player, table, seatPosition); // Deleting player from table
    debug(
      '----------just deleted player: ',
      player,
      ' seatPosition ',
      seatPosition
    );

    res.sendStatus(200); // Sending success status
  });

  // POST route to update lobby data of a table
  app.post('/table/lobby/data/:id', (req, res) => {
    const data = req.body;
    const params = req.params;
    const tableId = params.id;
    const { isCreatingTable, username, stakeLimit, selectedColor } = data;
    const table = getTable(tableId);
    const player = table.players.find((p) => p.name === username);
    player.bodyColor = selectedColor;

    if (isCreatingTable) table.finalStakeCount = parseInt(stakeLimit, 10);

    res.sendStatus(200); // Sending success status
  });

  // POST route to join the lobby of a table
  app.post('/table/Lobby/:id', (req, res) => {
    const data = req.body;
    const params = req.params;
    const tableId = params.id;
    const { username, seatId } = data;
    const table = getTable(tableId);

    if (table.players.find((p) => p.name === username)) {
      debug('found a previous copy of player');
      const copyPlayer = table.players.find((p) => p.name === username);
      const seatPosition: number = table.players.indexOf(copyPlayer);
      debug('seatposition', seatPosition);
      deletePlayer(copyPlayer, table, seatPosition); // Deleting existing player with same name
      debug('deleted ', copyPlayer, 'at seat', seatPosition);
    }
    const player = addPlayer(username, table, seatId - 1); // Adding player to table
    debug('adding player to table: ', table, getTable(tableId));

    res.status(200).json({ id: player.id }); // Sending player ID as response
  });

  // POST route to create a new table
  app.post('/table/new', (req, res) => {
    let newTableID;

    do {
      newTableID = generateUUID(); // Generating new table ID
    } while (getTable(newTableID));

    createTable(newTableID); // Creating new table

    res.json(newTableID); // Sending new table ID as response

    debug(`Created new table with ID: ${newTableID}`);
  });

  // POST route to create a new single player table
  app.post('/table/newSinglePlayer', (req, res) => {
    debug('Creating new Single player table');

    let newTableID;

    do {
      newTableID = generateUUID();
    } while (getTable(newTableID));

    const table = createTable(newTableID); // Creating new table

    const stakeLimit = parseInt(req.body.stakeLimit, 10);
    table.finalStakeCount = stakeLimit;

    //Adding players 1-4 to the table
    const p1 = addPlayer(req.body.name, table, 0);
    const p2 = addPlayer('Player 2', table, 1);
    const p3 = addPlayer('Player 3', table, 2);
    const p4 = addPlayer('Player 4', table, 3);

    //setting players 2,3 and 4 as computer players, and connecting them to the table
    p2.setAutoPlay(computerLevel1);
    p2.connectPlayer(null);
    p3.setAutoPlay(computerLevel1);
    p3.connectPlayer(null);
    p4.setAutoPlay(computerLevel1);
    p4.connectPlayer(null);

    debug('Created new SinglePlayer table:', table);
    res.json({ tableId: newTableID, playerId: p1.id }); // Sending table and player ID as response
  });

  // GET route to fetch data of a table
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

    res.send(data); // Sending table data as response
  });

  // GET route to delete a table
  app.get('/table/delete/:id', (req, res) => {
    const params = req.params;
    const id = params.id;
    if (getTable(id)) deleteTable(id); // Deleting table if exists
  });
}
