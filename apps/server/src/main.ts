import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createWebSocketServer } from './lib/wsServer';
import { createRoutes } from './routes/routes';
import debugLog from 'debug';
import { getAppUrl } from './global';

const debug = debugLog('main');
debugLog.enable('* -routes wsServer table -table.sendUpdates -computerPlayer1');

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();
createWebSocketServer();

app.use(bodyParser.json());
app.use(
  cors({
    origin: [getAppUrl().clientUrl],
  })
);

createRoutes(app);

app.listen(port, () => {
  console.log(`[ ready ] http://${port}`);
});
