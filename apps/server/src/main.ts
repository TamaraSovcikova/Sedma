import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createRoutes } from './routes/routes';
import { getConfig } from './global';
import debugLog from 'debug';

//debug module
const debug = debugLog('main');
debugLog.enable(
  '* routes table -wsServer  -table.sendUpdates -computerPlayer1'
);

//Centralization of environment variables
const port = getConfig().port;

const app = express();

app.use(bodyParser.json());
app.use(
  cors({
    origin: [getConfig().clientUrl],
  })
);

createRoutes(app);

app.listen(port, () => {
  console.log(`[ ready ] http://${port}`);
});
