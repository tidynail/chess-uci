import { Process } from './process.js';

export default class Engine {
  /**
   * 
   * @param {string} path 
   * @param {boolean} [log] 
   * @param {boolean} [log_recv]
   * @param {boolean} [log_send]
   * @return {Engine}
   */
  static async start(path, log = false, log_recv = true, log_send = true) {
    var engine = new Engine(path,log, log_recv, log_send)
    await engine.uci();
    return engine;
  }

  CMD_REPLY = {
    uci: "uciok",
    isready: "readyok",
    stop: "bestmove",
    go: "bestmove",
    quit: "quit",     // special, handlded by onExit
  };

  /**
   * @constructor
   * @param {string} path
   * @param {boolean} [log] 
   * @param {boolean} [log]
   * @param {boolean} [log]
  */
  constructor(path, log = false, log_recv = true, log_send = true) {
    this.process = new Process(path);
    if (!this.process.isRunning) {
      if (this.process.error) throw this.process.error;
      throw new Error("Engine failed to start");
    }

    this.id = {};
    this.options = {};

    // go result
    this.pvs = [];      // principal variations
      // {depth, score, moves}
    this.result = {};   // bestmove and ponder

    this.logger_recv=(log&&log_recv)?console:null;
    this.logger_send=(log&&log_send)?console:null;

    this.waiting_reply = {};
    this.on_info = null;  // callback for info
    this.on_result = null;  // callback for bestmove

    this.process.onReadLine((line) => {
      this.logger_recv?.log(`<- "${line}"`);
      this.parse(line);
    });

    this.process.onExit((code) => {
      delete this.waiting_reply.quit;
    });
  }

  get isRunning() {
    return this.process.isRunning;
  }

  async uci() {
    this.send("uci");
    await this.wait()
  }

  ucinewgame() {
    this.send('ucinewgame');
    return this;
  }

  /**
   * @param {object} options name: value
   */
  setoption(options) {
    for (const [key, value] of Object.entries(options)) {
      this.send(`setoption name ${key} value ${value}`);
    }
    return this;
  }

  async isready() {
    this.send('isready');
    await this.wait();
  }
  /**
   * @param {object} [params]
   * @param {string} [params.fen] startpos if missed
   * @param {string[]} [params.moves]
   * 
   * or
   * @param {string} fen
   */
  position(params) {
    let pos = "startpos";
    let mvstr = "";

    if(typeof params === "string") {
      pos = `fen ${params}`;
    }
    else if(typeof params === "object")
    {
      if(params.hasOwnProperty("fen"))
        pos = params.fen.length>0?`fen ${params.fen}`:"startpos";
      if(params.hasOwnProperty("moves"))
        mvstr = params.moves.length>0?" moves "+params.moves.join(" "):"";        
    }
    
    let cmd = `position ${pos}${mvstr}`;
    this.send(cmd);
    return this;
  }

  /**
   * @param {object} [params]
   * @param {string[]} [params.searchmoves] restrict search to this moves only
   * @param {boolean} [params.ponder] pondering mode
   * @param {number} [params.wtime] white left time in ms
   * @param {number} [params.btime] black left time in ms
   * @param {number} [params.winc] white inc time per move in ms
   * @param {number} [params.binc] black inc time per move in ms
   * @param {number} [params.movestogo] left move to next time control
   * @param {number} [params.depth] plies to search
   * @param {number} [params.nodes] nodes to search
   * @param {number} [params.mate] search mate in move
   * @param {number} [params.movetime] search time in ms
   * @param {(object: info)} [onInfo] callback receiving parsed info
   * @param {(object: result)} [onResult] called at final with bestmove
   * @return {promise<{object: result}>} result object {bestmove, ponder}
   * or
   * @param {number} depth
   */
  async go(params = null, onInfo = null, onResult = null) {
    function make(params) {
      let out = "";

      if(typeof params === "undefined" || params == null)
        return out;

      if(typeof params === "number" && params)
      {
        out = ` depth ${params}`;
        return out;
      }

      const PARAMS = [
        "searchmoves", //[moves]
        "ponder",
        "wtime",
        "btime",
        "winc",
        "binc",
        "movestogo",
        "depth",
        "nodes",
        "mate",
        "movetime",
      ]
    
      PARAMS.forEach(param => {
        if (!Object.prototype.hasOwnProperty.call(params, param)) return;

        switch (param) {
          case 'searchmoves':
            if (params[param].length>0) {
              out += ' searchmoves ' + params[param].join(" ");
            }
          break;

          case 'ponder':
            if (params[param]) {
              out += ` ${param}`;
            }
          break;

          default:
            if (params[param] >= 0) {
              out += ` ${param} ${params[param]}`;
            }
          break;
        }
      });
    
      return out;
    }

    let param = make(params);
    let cmd = "go" + (param.length>0?param:" infinite");
    this.on_info = onInfo;
    this.on_result = onResult;
    this.pvs = [];  // clear pvs
    this.send(cmd);

    await this.wait(0);
    return this.result;
  }

  /**
   * @return {void}
   */
  stop() {
    this.send("stop");
    return this;
  }

  /**
   * @return {void}
   */
  async quit() {
    this.send("quit");
    await this.wait();
  }

  ponderhit() {
    this.send("ponderhit");
    return this;
  }

  /**
   * @param {string} cmd
   * @return {void}
   */
  send(cmd) {
    // waiting cmds update
    const name = cmd.split(' ')[0];
    if(this.CMD_REPLY[name]) {
      this.waiting_reply[this.CMD_REPLY[name]] = true;
    }

    this.logger_send?.log(`-> "${cmd}"`);
    this.process.send(cmd);
  }  

  kill() {
    this.process.kill();
  }

  /**
   * wait until no waiting reply or 'seconds'
   * @param {number} seconds (deafult 5)
   */
  async wait(seconds = 5) {
    var theObj = this;

    const promise = new Promise((resolve, reject) => {
      var checked = 0;

      function check(resolve, reject) {
        if(Object.keys(theObj.waiting_reply).length==0) {
          resolve();
        }
        else {
          if(!seconds || checked++ < (seconds*100))
            setTimeout(check, 10, resolve, reject);
          else
            reject(new Error("Timeout to reply"))
        }
      }
      setTimeout(check, 10, resolve, reject);
    });

    try {
      await promise;
    } catch(err) {
      throw err;
    }
  }

  /**
   * @param {number} value
   * @return {number} next max values for mate value
   */
  adjusted_mate_score(value) {
    return (value>=0)?(Number.MAX_SAFE_INTEGER-value)
      :(Number.MIN_SAFE_INTEGER-value);
  }

  /**
   * 
   * @param {score} score 
   */
  score_string(score) {
    if(score.type=="mate") {
      return `#${score.value}`;
    }
    return (score.value / 100).toString();
  }

  parse(line) {
    if (line.startsWith("info")) {
      let info = {};

      const NUMFIELDS = [
        "depth",
        "seldepth",
        "time",
        "nodes",
        "multipv",
        "currmovenumber",
        "hashfull",
        "nps",
        "tbhits",
        "sbhits",
        "cpuload",
      ];

      NUMFIELDS.forEach((field) => {
        let re = new RegExp(`\\s${field}\\s(\\d+)`);
        const matches = line.match(re)
        if (matches !== null)
          info[field] = parseInt(matches[1]);
      });

      // pv
      {
        const matches = line.match(/\spv\s([a-hqnr1-8\s]+)$/)

        if (matches !== null) {
            info.pv = [];
            const moves = matches[1].split(" ");
            for (let i = 0, length = moves.length; i < length; i++) {
                info.pv.push(moves[i]);
            }
        }
      }

      // score
      {
        const matches = line.match(/\sscore\s(\w+)\s([-\d+]+)/);
        if (matches !== null) {
          if(matches[1]=="lowerbound") {
            info.score = {
              type: "cp",
              value: Number.MIN_SAFE_INTEGER,
              cp: Number.MIN_SAFE_INTEGER,
            };
          }
          else if(matches[1]=="upperbound") {
            info.score = {
              type: "cp",
              value: Number.MAX_SAFE_INTEGER,
              cp: Number.MAX_SAFE_INTEGER
            };
          }
          else {
            info.score = {
              type: matches[1],
              value: parseInt(matches[2]),
              cp: (matches[1]=="mate")?this.adjusted_mate_score(parseInt(matches[2])):parseInt(matches[2]),
            }
          }
          info.score.str = this.score_string(info.score);

        }
      }

      // currmove
      {
        const matches = line.match(/\scurrmove\s([a-hqnr1-8]+)/);
        if (matches !== null) {
          info.currmove = matches[1];
        }
      }

      // string
      {
        const matches = line.match(/\sstring\s(.*)/);
        if (matches !== null) {
          info.string = matches[1];
        }
      }

      // update pvs based on evaluation info
      {
        let ipv = info.hasOwnProperty("multipv")?Math.max(0,info.multipv-1):0;
        while((ipv+1) > this.pvs.length) this.pvs.push({});

        if(info.hasOwnProperty("score")&&info.hasOwnProperty("pv"))
        {
          this.pvs[ipv].score = info.score;
          this.pvs[ipv].moves = info.pv;
        }

        if(info.hasOwnProperty("depth"))
          this.pvs[ipv].depth = info.depth;
        if(info.hasOwnProperty("time"))
          this.pvs[ipv].time = info.time;
        if(info.hasOwnProperty("nodes"))
          this.pvs[ipv].nodes = info.nodes;
      }

      if(this.on_info)
        this.on_info(info);
    }
    else if(line.startsWith("bestmove")) {
      const matches = line.match(/^bestmove\s([a-hqnr1-8]+)(?:\sponder\s([a-hqnr1-8]+))?/);
      if (matches !== null) {
        if(matches[2]) {
          this.result = {
            bestmove: matches[1],
            ponder: matches[2],
          }
        }
        else {
          this.result = {
            bestmove: matches[1],
          }
        }
      }

      if(this.on_result)
        this.on_result(this.result);

      delete this.waiting_reply.bestmove;
    }
    else if(line.startsWith("readyok")) {
      delete this.waiting_reply.readyok;
    }
    else if(line.startsWith("uciok")) {
      delete this.waiting_reply.uciok;
    }
    else if(line.startsWith("id")) {
      const tokens = line.match(/id\s(\S+)\s(.+)/);
      this.id[tokens[1]]=tokens[2];
    }
    else if(line.startsWith("option")) {
      const tokens = line.match(/option\sname\s(.+)\stype\s(\S+)(?:\sdefault\s(\S+)?)?(?:\smin\s(\S+))?(?:\smax\s(\S+))?/);
      const vars = [...line.matchAll(/(?:\svar\s(\S+))/g)].map((match) => match[1]);

      if (tokens !== null) {
        this.options[tokens[1]] = {
          type: tokens[2],
          default: tokens[3] || null,
          vars: vars.length ? vars : null,
          min: tokens[4] || null,
          max: tokens[5] || null,
        };
      }
    }
  }
}

