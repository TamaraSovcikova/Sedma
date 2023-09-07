import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { createWebSocketServer } from './lib/wsServer';
import { createRoutes } from './routes/routes';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();
createWebSocketServer();

app.use(bodyParser.json());
app.use(
  cors({
    origin: 'http://localhost:4200',
  })
);

createRoutes(app);

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
