/**
 * @typedef {Object} Option
 * @prop {string} type
 * @prop {string} default
 * @prop {string[]=} vars
 * @prop {string=} min
 * @prop {string=}max
 * 
 * @typedef {Record<string, Option>} Options
 * 
 * @typedef {Object} Score
 * @prop {string} type
 * @prop {number} value
 * @prop {number} cp      cp (centipawn) converted value
 *                        ex. {type: 'mate', value: 2} => Number.MAXNumber.MAX_SAFE_INTEGER-2;
 * @prop {string} str     string for display 
 *                        ex. {type: 'mate', value: 2} => #2
 * 
 * @typedef {Object} Pv
 * @prop {Score} score
 * @prop {number} depth
 * @prop {string[]} moves
 * @prop {number} time      in ms, time used to search
 * @prop {number} nodes     # of nodes searched
 * 
 * @typedef {Object} Result
 * @prop {number} depth
 * @prop {Score} score
 * @prop {string[]} moves
 * 
 * @typedef {Object} Pos
 * @prop {string=} fen   startpos if missed
 * @prop {string[]=} moves
 * 
 * @typedef {Object} Info
 * @prop {number} depth
 * @prop {number=} seldepth
 * @prop {number=} time      in ms
 * @prop {number=} nodes
 * @prop {string[]} pv
 * @prop {number=} multipv
 * @prop {Score} score
 * @prop {string=} currmove
 * @prop {number=} currmovenumber
 * @prop {number=} nps       nodes/second
 * @prop {number=} tbhits
 * @prop {number=} sbhits
 * @prop {number=} cpuload
 * @prop {string} string
 * 
 * @callback OnInfo
 * @param {Info} info
 * @return {void}
 *
 * @callback OnResult
 * @param {Result} result
 * @return {void}
 *
 * @typedef {Object} Param
 * @prop {string[]=} searchmoves restrict search to this moves only
 * @prop {boolean=} ponder pondering mode
 * @prop {number=} wtime white left time in ms
 * @prop {number=} btime black left time in ms
 * @prop {number=} winc white inc time per move in ms
 * @prop {number=} binc black inc time per move in ms
 * @prop {number=} movestogo left move to next time control
 * @prop {number=} depth plies to search
 * @prop {number=} nodes nodes to search
 * @prop {number=} mate search mate in move
 * @prop {number=} movetime search time in ms
 
 */
