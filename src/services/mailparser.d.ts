declare module 'mailparser' {
  export interface ParsedMail {
    text?: string;
    html?: string;
    textAsHtml?: string;
    subject?: string;
    date?: Date;
    to?: any;
    from?: any;
    cc?: any;
    bcc?: any;
    messageId?: string;
    inReplyTo?: string;
    references?: string[];
    headers?: Map<string, any>;
    attachments?: any[];
  }

  export function simpleParser(
    source: NodeJS.ReadableStream | Buffer | string,
    options?: any
  ): Promise<ParsedMail>;
}