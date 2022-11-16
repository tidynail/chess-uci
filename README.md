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

## Simple Evaluation
```javascript
import { Engine } from 'chess-uci';

let engine = new Engine('/path/to/engine');

engine.position('2k5/R1p3bp/1q6/3ppr2/Qp6/1p1PP3/1P1KP2P/2R5 b - - 0 1')
const result = await engine.go(16);

console.log(`bestmove ${result.bestmove}`);

engine.quit();
```

## Advanced Evaluation

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

engine.position({
  fen: "rn3rk1/ppp1b1pp/1n2p3/4N2Q/3qNR2/8/PPP3PP/R1B4K b - - 0 13",
  moves: ['d4e4']
});

const result = await engine.go(null/*infinite*/, (info) => {
  if(info.depth&&info.depth>10)
    engine.stop();
});

const bestpv = engine.pvs[0];
console.log(`${bestpv.score.str}/${bestpv.depth} ${result.bestmove} in ${bestpv.time}ms, ${bestpv.nodes} searched`);

// MultiPV search results
// chess-uci keeps the latest pvs (principal variations)
engine.pvs.forEach((pv, idx)=>{
  console.log(`${idx+1}:${pv.score.str}/${pv.depth} ${pv.moves[0]}`);
});

engine.quit();
```

## Async Evaluation

```javascript
import { Engine } from 'chess-uci';

let engine = new Engine('/path/to/engine');

engine
  .setoption({Threads: 4, Hash: 128}) // set multiple options
  .setoption({MultiPV: 4})  // and more
  .ucinewgame()
  .position({
    fen: "rn3rk1/ppp1b1pp/1n2p3/4N2Q/3qNR2/8/PPP3PP/R1B4K b - - 0 13",
    moves: ['d4e4']
  })
  .go(16, (info) => {
    if(info.depth)
      console.log(`depth: ${info.depth}`);
  }, (result) => {
    const bestpv = engine.pvs[0];
    console.log(`${bestpv.score.str}/${bestpv.depth} ${result.bestmove} in ${bestpv.time}ms, ${bestpv.nodes} searched`);

    engine.pvs.forEach((pv, idx)=>{
      console.log(`${idx+1}:${pv.score.str}/${pv.depth} ${pv.moves[0]}`);
    });
    engine.quit();
  });
```

## Logging

```javascript
let engine = new Engine('/path/to/engine', 
  true    // logging all I/O with engine
);

let engine = new Engine('/path/to/engine', 
  true,   // logging enabled
  false   // disable logging data received from engine
);

let engine = new Engine('/path/to/engine', 
  true,   // logging enabled
  true,
  false   // disable logging data sent to engine
);

// Engine.start has same parameters
let engine = await Engine.start('./engines/stockfish', 
  true, false
);
```

## Examples

### position()
```javascript
engine.position()
  // position startpos
engine.position("2k5/R1p3bp/1q6/3ppr2/Qp6/1p1PP3/1P1KP2P/2R5 b - - 0 1")
  // position fen 2k5/R1p3bp/1q6/3ppr2/Qp6/1p1PP3/1P1KP2P/2R5 b - - 0 1
engine.position({
  fen: "rn3rk1/ppp1b1pp/1n2p3/4N2Q/3qNR2/8/PPP3PP/R1B4K b - - 0 13",
  moves: ['d4e4']
});
  // position fen rn3rk1/ppp1b1pp/1n2p3/4N2Q/3qNR2/8/PPP3PP/R1B4K b - - 0 13 moves d4e4
```

### go()
```javascript
engine.go();
  // go infinite 

engine.go(16);
  // go depth 16

engine.go({depth: 20});
  // go depth 20

engine.go({movetime: 2000})
  // go movetime 2000

engine.go({
  wtime: 45000,
  winc: 1000,
  btime: 38000,
  binc: 1000,
  movestogo: 40
});
  // go wtime 45000 btime 38000 winc 1000 binc 1000 movestogo 40

engine.go(16, (info) => {
  if(info.depth)
    console.log(`depth: ${info.depth}`);
});
  // ...
  // depth: 10
  // depth: 11
  // ....

engine.go(16, null, (result) => {
  const bestpv = engine.pvs[0];
  console.log(`${bestpv.score.str}/${bestpv.depth} ${result.bestmove} in ${bestpv.time}ms, ${bestpv.nodes} searched`);
});
  // #3/12 f4f8 in 75ms, 469280 searched
```

## Key Data Types

As explanied in [UCI Doc](http://wbec-ridderkerk.nl/html/UCIProtocol.html)

```javascript
(method) async Engine.go (params = null, onInfo = null, onResult = null) : result

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

onInfo = (object: info)

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

onResult = (object: result)

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
