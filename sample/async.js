import { Engine } from 'chess-uci';

let engine = new Engine('./engines/stockfish');

engine
  .setoption({Threads: 4, Hash: 128}) // set multiple options
  .setoption({MultiPV: 4})  // and more
  .ucinewgame()
  .position({
    fen: "rn3rk1/ppp1b1pp/1n2p3/4N2Q/3qNR2/8/PPP3PP/R1B4K b - - 0 13",
    moves: ['d4e4']
  })
  .go(16, info => {
    if(info.depth)
      console.log(`depth: ${info.depth}`);
  }, result => {
    const bestpv = engine.pvs[0];
    console.log(`${bestpv.score.str}/${bestpv.depth} ${result.bestmove} in ${bestpv.time}ms, ${bestpv.nodes} searched`);
    
    engine.pvs.forEach((pv, idx)=>{
      console.log(`${idx+1}:${pv.score.str}/${pv.depth} ${pv.moves[0]}`);
    });
    engine.quit();
  });
