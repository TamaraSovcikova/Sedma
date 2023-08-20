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

const corsOptions = {
  origin: clientUrl, // enable access from client app only
  optionsSuccessStatus: 200,
};

const app = express();

createWebSocketServer();

app.options('*', cors(corsOptions));
app.use(bodyParser.json());
app.use(cors(corsOptions));

createRoutes(app);
createDummyData();

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
  console.log(`[ client-url ] ${clientUrl}`);
});
