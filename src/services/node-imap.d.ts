declare module 'node-imap' {
  import { EventEmitter } from 'events';

  interface ImapConfig {
    user: string;
    password: string;
    host: string;
    port: number;
    tls?: boolean;
    tlsOptions?: any;
    authTimeout?: number;
    connTimeout?: number;
    keepalive?: boolean;
  }

  interface Box {
    name: string;
    readOnly?: boolean;
    newKeywords: boolean;
    uidvalidity: number;
    uidnext: number;
    flags: string[];
    permFlags: string[];
    persistentUIDs: boolean;
    messages: {
      total: number;
      new: number;
    };
  }

  interface FetchOptions {
    bodies?: string | string[];
    struct?: boolean;
    envelope?: boolean;
    size?: boolean;
  }

  interface ImapMessage extends EventEmitter {
    on(event: 'body', listener: (stream: NodeJS.ReadableStream, info: any) => void): this;
    on(event: 'attributes', listener: (attrs: any) => void): this;
    once(event: 'body', listener: (stream: NodeJS.ReadableStream, info: any) => void): this;
    once(event: 'attributes', listener: (attrs: any) => void): this;
  }

  interface ImapFetch extends EventEmitter {
    on(event: 'message', listener: (msg: ImapMessage, seqno: number) => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
    once(event: 'error', listener: (err: Error) => void): this;
    once(event: 'end', listener: () => void): this;
  }

  class Connection extends EventEmitter {
    constructor(config: ImapConfig);
    
    connect(): void;
    end(): void;
    destroy(): void;
    
    openBox(name: string, readOnly: boolean, callback: (err: Error | null, box?: Box) => void): void;
    closeBox(callback: (err: Error | null) => void): void;
    closeBox(autoExpunge: boolean, callback: (err: Error | null) => void): void;
    
    search(criteria: any[], callback: (err: Error | null, results: number[]) => void): void;
    fetch(source: number | number[] | string, options: FetchOptions): ImapFetch;
    
    on(event: 'ready', listener: () => void): this;
    on(event: 'error', listener: (err: Error) => void): this;
    on(event: 'end', listener: () => void): this;
    on(event: 'close', listener: (hadError: boolean) => void): this;
    
    once(event: 'ready', listener: () => void): this;
    once(event: 'error', listener: (err: Error) => void): this;
    once(event: 'end', listener: () => void): this;
    once(event: 'close', listener: (hadError: boolean) => void): this;
  }

  export = Connection;
}