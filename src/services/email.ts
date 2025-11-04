import * as Imap from 'node-imap';
import { simpleParser } from 'mailparser';
import fetch from 'node-fetch';
import { Logger } from '../utils/logger';
import config from '../config';
import { EmailConfig } from '../types';

export class EmailService {
  private imap: Imap;
  private emailConfig: EmailConfig;

  constructor(emailConfig?: EmailConfig) {
    this.emailConfig = emailConfig || config.email;
    this.imap = new Imap(this.emailConfig);
  }

  public async waitForVerificationEmail(username: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.once('ready', () => {
        Logger.info(`[IMAP] Ready! Looking for verification link for ${username}`);
        this.openInbox((err) => {
          if (err) {
            reject(err);
            return;
          }
          this.searchForVerificationEmail(username, resolve, reject);
        });
      });

      this.imap.once('error', (err) => {
        Logger.error('[IMAP] Connection error:', err);
        reject(err);
      });

      this.imap.once('end', () => {
        Logger.info('[IMAP] Connection ended');
      });

      this.imap.connect();
    });
  }

  public async waitFor2AuthCode(username: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.imap.once('ready', () => {
        Logger.info(`[IMAP] Ready! Looking for 2auth code for ${username}`);
        this.openInbox((err) => {
          if (err) {
            reject(err);
            return;
          }
          this.searchFor2AuthCode(username, resolve, reject);
        });
      });

      this.imap.once('error', (err) => {
        Logger.error('[IMAP] Connection error:', err);
        reject(err);
      });

      this.imap.once('end', () => {
        Logger.info('[IMAP] Connection ended');
      });

      this.imap.connect();
    });
  }

  public async waitForLoginVerification(username: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.imap.once('ready', () => {
        Logger.info(`[IMAP] Ready! Looking for login verification for ${username}`);
        this.openInbox((err) => {
          if (err) {
            reject(err);
            return;
          }
          this.searchForLoginVerification(username, resolve, reject);
        });
      });

      this.imap.once('error', (err) => {
        Logger.error('[IMAP] Connection error:', err);
        reject(err);
      });

      this.imap.once('end', () => {
        Logger.info('[IMAP] Connection ended');
      });

      this.imap.connect();
    });
  }

  private openInbox(callback: (err: Error | null, box?: any) => void): void {
    this.imap.openBox('INBOX', true, callback);
  }

  private searchForVerificationEmail(
    username: string,
    resolve: () => void,
    reject: (err: Error) => void
  ): void {
    const searchDate = new Date();
    searchDate.setDate(searchDate.getDate() - 1);
    const dateString = searchDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });

    this.imap.search(['UNSEEN', ['SINCE', dateString]], (err, results) => {
      if (err) {
        reject(err);
        return;
      }

      const fetch = this.imap.fetch(results, { bodies: '' });

      fetch.on('message', (msg) => {
        msg.on('body', async (stream) => {
          try {
            const parsed = await simpleParser(stream);
            if (parsed.html && parsed.html.toString().includes(username)) {
              const html = parsed.html.toString();
              const match = html.match(/<a href="([^"]+)">Click here to confirm your e-mail address!/);
              
              if (match && match[1]) {
                const verifyLink = match[1];
                Logger.success('[IMAP] Found Verification Link!');
                await this.verifyEmail(verifyLink);
                this.imap.end();
                resolve();
              }
            }
          } catch (error) {
            Logger.error('Error parsing email:', error);
          }
        });
      });

      fetch.once('error', (err) => {
        Logger.error('Fetch error:', err);
        reject(err);
      });

      fetch.once('end', () => {
        this.imap.end();
      });
    });
  }

  private searchFor2AuthCode(
    username: string,
    resolve: (code: string) => void,
    reject: (err: Error) => void
  ): void {
    const searchDate = new Date();
    searchDate.setDate(searchDate.getDate() - 1);
    const dateString = searchDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });

    this.imap.search(['UNSEEN', ['SINCE', dateString]], (err, results) => {
      if (err) {
        reject(err);
        return;
      }

      const fetch = this.imap.fetch(results, { bodies: '' });

      fetch.on('message', (msg) => {
        msg.on('body', async (stream) => {
          try {
            const parsed = await simpleParser(stream);
            if (parsed.html && parsed.html.includes(username) && parsed.html.toLowerCase().includes('one-time')) {
              const html = parsed.html;
              const match = html.match(/Here's your one-time code: <b>([^<]+)<\/b>/);
              
              if (match && match[1]) {
                const code = match[1].trim();
                Logger.success('[IMAP] Found One Time Code!');
                this.imap.end();
                resolve(code);
              }
            }
          } catch (error) {
            Logger.error('Error parsing email:', error);
          }
        });
      });

      fetch.once('error', (err) => {
        Logger.error('Fetch error:', err);
        reject(err);
      });

      fetch.once('end', () => {
        this.imap.end();
      });
    });
  }

  private searchForLoginVerification(
    username: string,
    resolve: () => void,
    reject: (err: Error) => void
  ): void {
    const searchDate = new Date();
    searchDate.setDate(searchDate.getDate() - 1);
    const dateString = searchDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });

    this.imap.search(['UNSEEN', ['SINCE', dateString]], (err, results) => {
      if (err) {
        reject(err);
        return;
      }

      const fetch = this.imap.fetch(results, { bodies: '' });

      fetch.on('message', (msg) => {
        msg.on('body', async (stream) => {
          try {
            const parsed = await simpleParser(stream);
            if (parsed.html && parsed.html.includes(username) && parsed.html.includes('Yep, that was me logging in from')) {
              const html = parsed.html;
              const match = html.match(/href="([^"]+)">Yep, that was me logging/);
              
              if (match && match[1]) {
                const verifyLink = match[1];
                Logger.success('[IMAP] Found Login Verification Link!');
                await this.verifyLogin(verifyLink);
                this.imap.end();
                resolve();
              }
            }
          } catch (error) {
            Logger.error('Error parsing email:', error);
          }
        });
      });

      fetch.once('error', (err) => {
        Logger.error('Fetch error:', err);
        reject(err);
      });

      fetch.once('end', () => {
        this.imap.end();
      });
    });
  }

  private async verifyEmail(link: string): Promise<void> {
    try {
      Logger.info(`[+] Verification Link - ${link}`);
      const response = await fetch(link, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Origin': 'https://vrchat.com',
        },
      });

      const text = await response.text();
      if (text.includes('VR')) {
        Logger.success('[✔] Email Verified');
      }
    } catch (error) {
      Logger.error('Error verifying email:', error);
      throw error;
    }
  }

  private async verifyLogin(link: string): Promise<void> {
    try {
      Logger.info(`[+] Login Verification Link - ${link}`);
      const response = await fetch(link, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Origin': 'https://vrchat.com',
        },
      });

      const text = await response.text();
      Logger.success('[✔] Login Verified');
    } catch (error) {
      Logger.error('Error verifying login:', error);
      throw error;
    }
  }
}