import express from 'express';


const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

import cors from 'cors';
import { getGlobal } from './global';
import bodyParser from 'body-parser';
import { Table } from './lib/types';


const corsOptions = {
  origin: getGlobal().clientUrl 
}
app.use(cors(corsOptions))
app.use(bodyParser.json())

app.get('/api', (req, res) => {
  res.json({message:'Hello API'});
});
app.post("/table/:id", (req, res) => {
  const data = req.body;
  const params = req.params;
  const id = params.id;
  console.log(id);
  console.log("table recieved", data);
  res.send({status: "okey"});
});
app.get("/table/:id", (req, res) => {
  const params = req.params;
  const id = params.id;
  console.log(id);  
  const data = {players: ""} //add data to be able to form a table 
  res.send(data);
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
