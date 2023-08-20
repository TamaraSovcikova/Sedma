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
  preflightContinue: false,
  credentials: false,
};

console.log('corsOptions', corsOptions);

const app = express();

createWebSocketServer();

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));
app.use(bodyParser.json());

createRoutes(app);
createDummyData();

app.listen(port, host, () => {
  console.log(`api listening at http://${host}:${port}`);
  console.log(`client-url=${clientUrl}`);
});
