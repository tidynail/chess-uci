type Option = {
    type: string;
    default: string;
    vars?: string[] | undefined;
    min?: string | undefined;
    max?: string | undefined;
};
type Options = Record<string, Option>;
type Score = {
    type: string;
    value: number;
    /**
     * cp (centipawn) converted value
     * ex. {type: 'mate', value: 2} => Number.MAXNumber.MAX_SAFE_INTEGER-2;
     */
    cp: number;
    /**
     * string for display
     * ex. {type: 'mate', value: 2} => #2
     */
    str: string;
};
type Pv = {
    score: Score;
    depth: number;
    moves: string[];
    /**
     * in ms, time used to search
     */
    time: number;
    /**
     * # of nodes searched
     */
    nodes: number;
};
type Result = {
    depth: number;
    score: Score;
    moves: string[];
};
type Pos = {
    /**
     * startpos if missed
     */
    fen?: string | undefined;
    moves?: string[] | undefined;
};
type Info = {
    depth: number;
    seldepth?: number | undefined;
    /**
     * in ms
     */
    time?: number | undefined;
    nodes?: number | undefined;
    pv: string[];
    multipv?: number | undefined;
    score: Score;
    currmove?: string | undefined;
    currmovenumber?: number | undefined;
    /**
     * nodes/second
     */
    nps?: number | undefined;
    tbhits?: number | undefined;
    sbhits?: number | undefined;
    cpuload?: number | undefined;
    string: string;
};
type OnInfo = (info: Info) => void;
type OnResult = (result: Result) => void;
type Param = {
    /**
     * restrict search to this moves only
     */
    searchmoves?: string[] | undefined;
    /**
     * pondering mode
     */
    ponder?: boolean | undefined;
    /**
     * white left time in ms
     */
    wtime?: number | undefined;
    /**
     * black left time in ms
     */
    btime?: number | undefined;
    /**
     * white inc time per move in ms
     */
    winc?: number | undefined;
    /**
     * black inc time per move in ms
     */
    binc?: number | undefined;
    /**
     * left move to next time control
     */
    movestogo?: number | undefined;
    /**
     * plies to search
     */
    depth?: number | undefined;
    /**
     * nodes to search
     */
    nodes?: number | undefined;
    /**
     * search mate in move
     */
    mate?: number | undefined;
    /**
     * search time in ms
     */
    movetime?: number | undefined;
};
declare module "process" {
    export class Process {
        constructor(path: any);
        process: any;
        error: any;
        get isRunning(): boolean;
        /**
         * @param {string} command
         * @return {void}
         */
        send(command: string): void;
        /**
         * @param {(line : string) => void} callback
         */
        onReadLine(callback: (line: string) => void): void;
        /**
         * @param {(code : number) => void} callback
         */
        onExit(callback: (code: number) => void): void;
    }
}
declare module "engine" {
    export class Engine {
        /**
         * async start
         * @param {string} path
         * @param {boolean=false} log
         * @param {boolean=true} log_recv
         * @param {boolean=true} log_send
         * @return {Engine}
         */
        static start(path: string, log?: boolean, log_recv?: boolean, log_send?: boolean): Engine;
        /**
         * @constructor
         * @param {string} path
         * @param {boolean=false} log
         * @param {boolean=true} log_recv
         * @param {boolean=true} log_send
         *    * @return {Engine}
         */
        constructor(path: string, log?: boolean, log_recv?: boolean, log_send?: boolean);
        process: Process;
        /** @type {Object[]} */
        id: any[];
        /** @type {Options} */
        options: Options;
        /** @type {Pv[]} */
        pvs: Pv[];
        /** @type {Result} */
        result: Result;
        /** @private */
        private logger_recv;
        /** @private */
        private logger_send;
        /** @private */
        private waiting_reply;
        /** @private */
        private on_info;
        /** @private */
        private on_result;
        /**
         * check if engine is running
         * @return {boolean}
         */
        get isRunning(): boolean;
        /**
         * send 'uci' command and wait
         * @return {void}
         */
        uci(): void;
        /**
         * send 'ucinewgame'
         * @return {Engine}
         */
        ucinewgame(): Engine;
        /**
         * send options
         * @param {Options} options
         * @return {Engine}
         */
        setoption(options: Options): Engine;
        /**
         * send 'isready' command and wait
         * @return {void}
         */
        isready(): void;
        /**
         * send 'position'
         * @param {Pos | string} params  fen if string
         * @return {Engine}
         */
        position(params: Pos | string): Engine;
        /**
         * go search
         * @param {Param | number=} params depth if number, infinite if missed
         * @param {OnInfo=} onInfo callback receiving parsed info
         * @param {OnResult=} onResult called at final with bestmove result
         */
        go(params?: (Param | number) | undefined, onInfo?: OnInfo | undefined, onResult?: OnResult | undefined): Promise<Result>;
        /**
         * send 'stop' command
         * @return {Engine}
         */
        stop(): Engine;
        /**
         * send 'quit' command and wait
         * @return {void}
         */
        quit(): void;
        /**
         * send 'ponderhit' command
         * @return {Engine}
         */
        ponderhit(): Engine;
        /**
         * @private
         * @param {string} cmd
         * @return {void}
         */
        private send;
        /**
         * @private
         */
        private kill;
        /**
         * wait until no waiting reply or 'seconds'
         * @private
         * @param {number} seconds (deafult 5)
         */
        private wait;
        /**
         * @private
         * @param {number} value
         * @return {number} next max values for mate value
         */
        private adjusted_mate_score;
        /**
         * @private
         * @param {score} score
         */
        private score_string;
        /**
         * @private
         */
        private parse;
    }
    import { Process } from "process";
}
//# sourceMappingURL=index.d.ts.map