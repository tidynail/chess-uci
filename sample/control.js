import { Engine } from 'chess-uci';

let engine = await Engine.start('./engines/stockfish');
// or
//let engine = new Engine('./engines/stockfish');
//await engine.uci();
console.log(engine.id, engine.options)

engine
  .setoption({Threads: 4, Hash: 128}) // set multiple options
  .setoption({MultiPV: 4})  // and more
  .ucinewgame()
await engine.isready()  // optional, sync with engine as suggested by UCI doc

engine.position("rn3rk1/ppp1b1pp/1n2p3/4N2Q/3qNR2/8/PPP3PP/R1B4K b - - 0 13", ['d4e4'])
const result = await engine.go({}/*infinite*/, (info) => {
  if(info.depth&&info.depth>10)
    engine.stop();
});
console.log(result);      // {bestmove, ponder}
engine.pvs.forEach((pv, idx)=>{
  console.log(`${idx+1}:${pv.score.str}/${pv.depth} ${pv.moves[0]}`);
});
await engine.quit();
