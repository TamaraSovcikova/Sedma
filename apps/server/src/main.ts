import express from 'express';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

import cors from 'cors';
import { getGlobal } from './global';
import bodyParser from 'body-parser';
//import { getTable, playCard } from './lib/game';

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
  switch(data.cmd) {
    case 'Play': 
      //TODO const t = playCard(); // add data
      res.send();
      break;
  }
  res.send({status: "okey"}); //program play card
});
app.get("/table/:id", (req, res) => {
  const params = req.params;
  const id = params.id;
  console.log(id);  
  //const table = getTable(id);
    //use the data from the table to set data 

  const data = {
  players: ["Tim","Pim","Jim","Kim"],
  lastPlayedCards: [ 
     { suit: 'heart', face: 'seven' },
    { suit: 'heart', face: 'king' },
    { suit: 'acorn', face: 'eight' },
    { suit: 'bell', face: 'ace' }],
  hand: [
    { suit: 'heart', face: 'seven' },
    { suit: 'heart', face: 'king' },
    { suit: 'acorn', face: 'eight' },
    { suit: 'bell', face: 'ace' }]}
  res.send(data);
  });

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
