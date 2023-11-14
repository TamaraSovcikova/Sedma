import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createRoutes } from './routes/routes';
import debugLog from 'debug';
import { getConfig } from './global';

const debug = debugLog('main');
debugLog.enable('* routes -wsServer table -table.sendUpdates -computerPlayer1');

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
