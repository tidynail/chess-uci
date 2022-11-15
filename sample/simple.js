import { Engine } from 'chess-uci';

let engine = new Engine('./engines/stockfish',true,false);

engine.position('2k5/R1p3bp/1q6/3ppr2/Qp6/1p1PP3/1P1KP2P/2R5 b - - 0 1')
//engine.position()
//engine.position({
//  fen: "rn3rk1/ppp1b1pp/1n2p3/4N2Q/3qNR2/8/PPP3PP/R1B4K b - - 0 13",
//  moves: ['d4e4']
//});

const result = await engine.go(16);
//const result = await engine.go({
//  wtime: 45000,
//  winc: 1000,
//  btime: 38000,
//  binc: 1000,
//  movestogo: 40
//})

console.log(`bestmove ${result.bestmove}`);
await engine.quit();
