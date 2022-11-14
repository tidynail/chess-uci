import { Engine } from 'chess-uci';

let engine = new Engine('./engines/stockfish');

engine.position('2k5/R1p3bp/1q6/3ppr2/Qp6/1p1PP3/1P1KP2P/2R5 b - - 0 1')
const result = await engine.go({depth: 16});
console.log(result);
await engine.quit();
