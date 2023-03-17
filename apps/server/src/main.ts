import express from 'express';


const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

import cors from 'cors';
import { getGlobal } from './global';
import bodyParser from 'body-parser';


const corsOptions = {
  origin: getGlobal().clientUrl 
}
app.use(cors(corsOptions))
app.use(bodyParser.json())

app.get('/api', (req, res) => {
  res.json({message:'Hello API'});
});
app.post("/table", (req, res) => {
  const data = req.body;
  console.log("table recieved", data);
  res.send({status: "okey"});
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
