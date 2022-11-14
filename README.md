# chess-uci

UCI, Universal Chess Interface, for Node.js

## Why Another?

1. Non-block sync interface for CLI use
2. Transparent and comprehensive UCI implenemation, like MultiPV
3. Simple, no dependency

## Install

```zsh
npm install chess-uci
```

## Simple FEN Evaulation

```javascript
import { Engine } from 'chess-uci';

let engine = new Engine('/path/to/engine');

engine.position('2k5/R1p3bp/1q6/3ppr2/Qp6/1p1PP3/1P1KP2P/2R5 b - - 0 1')
const result = await engine.go({depth: 16});
console.log(result);

await engine.quit();
```

## More Controlled Evaluation

```javascript
import { Engine } from 'chess-uci';

let engine = await Engine.start('/path/to/engine');
// or
//let engine = new Engine('/path/to/engine');
//await engine.uci();
console.log(engine.id, engine.options)

engine
  .setoption({Threads: 4, Hash: 128}) // set multiple options
  .setoption({MultiPV: 4})  // and more
  .ucinewgame()
await engine.isready()  // optional, sync with engine
                        // as suggested by UCI doc

engine.position(
  "rn3rk1/ppp1b1pp/1n2p3/4N2Q/3qNR2/8/PPP3PP/R1B4K b - - 0 13", // fen
  ['d4e4']);  // moves

const result = await engine.go({}/*infinite*/, (info) => {
  if(info.depth&&info.depth>10)
    engine.stop();
});

console.log(result);      // {bestmove, ponder}

// MultiPV search results
// chess-uci keeps the latest pvs (principal variations)
engine.pvs.forEach((pv, idx)=>{
  console.log(`${idx+1}:${pv.score.str}/${pv.depth} ${pv.moves[0]}`);
});

await engine.quit();
```

## Logging I/O

```javascript
import * as readline from 'node:readline';
import { exit, stdin as input, stdout as output } from 'node:process';
import { Engine } from 'chess-uci';

let engine = new Engine('/path/to/engine', 
  true  // logging all I/O with engine
)

const rl = readline.createInterface({ input, output });
rl.on('line', (line) => {
  engine.send(line)
  if(line=="quit")
    exit()
});
```

# Key Data Types

## async go()

Mostly, as in UCI Doc

```javascript
(method) async Engine.go (params = {}, callback = null) : result

params = {
  searchmoves: string[],
  ponder: boolean,
  wtime: number,
  btime: number,
  winc: number,
  binc: number,
  movestogo: number,
  depth: number,
  nodes: number,
  mate: number,
  movetime: number
};

callback = (object: info)
info = {
  depth: number,
  seldepth: number,
  time: number,
  nodes: number,
  pv: string[],
  multipv: number,
  score: { 
    type: string, 
    value: number, 
    cp: number,  // cp (centipawn) converted value
                 // ex. {type: 'mate', value: 2} => Number.MAXNumber.MAX_SAFE_INTEGER-2;
    str: string  // string for display 
                 // ex. {type: 'mate', value: 2} => #2
  },
  currmove: string,
  currmovenumber: number,
  nps: number,
  tbhits: number,
  sbhits: number,
  cpuload: number,
  string: string
};

result = {
  bestmove: string,
  ponder: string
};
```

## Engine.pvs

An array of the latest pv (principal variation) based on info.
Engine.pvs.length == MultiPV or 1

```javascript
Engine.pvs[i] = {
  score: { 
    type: string, 
    value: number, 
    cp: number,  // cp (centipawn) converted value
                 // ex. {type: 'mate', value: 2} => Number.MAXNumber.MAX_SAFE_INTEGER-2;
    str: string  // string for display 
                 // ex. {type: 'mate', value: 2} => #2
  },
  depth: number,
  moves: string[],
  time: number,
  nodes: number
};
```
