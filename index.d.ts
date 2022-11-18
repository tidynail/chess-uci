export = Engine;

declare class Engine {
  static async start(path: string, 
    log?: boolean = false, log_recv?: boolean = true, log_send: boolean = true): Engine;

  constructor(path: string, 
    log?: boolean = false, log_recv?: boolean = true, log_send: boolean = true);
}