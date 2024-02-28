import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createRoutes } from './routes/routes';
import { getConfig } from './global';
import debugLog from 'debug';

//debug module
const debug = debugLog('main');
// Enabling specific debug namespaces
debugLog.enable('* routes table -wsServer  -table.sendUpdates computerPlayer1');

//Centralization of environment variables
const port = getConfig().port; // Getting port from configuration

const app = express(); // Creating Express application

// Using body-parser middleware to parse JSON request bodies
app.use(bodyParser.json());

// Allowing requests only from client URL specified in configuration
app.use(
  cors({
    origin: [getConfig().clientUrl],
  })
);

createRoutes(app);

app.listen(port, () => {
  // Starting server
  console.log(`[ ready ] http://${port}`);
});
