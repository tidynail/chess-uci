import * as readline from 'node:readline';
import { exit, stdin as input, stdout as output } from 'node:process';
import { Engine } from 'chess-uci';

let engine = new Engine('./engines/stockfish', 
  true  // logging all I/O with engine
)

const rl = readline.createInterface({ input, output });
rl.on('line', (line) => {
  engine.send(line)
  if(line=="quit")
    exit()
});
