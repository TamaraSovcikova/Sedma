import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createWebSocketServer } from './lib/wsServer';
import { createRoutes } from './routes/routes';
import { createDummyData } from './lib/dummy-data';
import { getConfig } from './global';

const host = 'localhost';
const port = 3000;
const clientUrl = getConfig().clientUrl;

const app = express();
createWebSocketServer();

app.use(bodyParser.json());
app.use(
  cors({
    origin: clientUrl, // allow connections only from the client
  })
);

createRoutes(app);
createDummyData();

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
  console.log(`[ client-url ] ${clientUrl}`);
});
