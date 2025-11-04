import { ProxyConfig } from '../types';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Logger } from './logger';

export class ProxyManager {
  private static proxies: string[] = [];
  private static readonly PROXY_FILE = 'proxies.txt';

  public static async loadProxies(): Promise<void> {
    try {
      const proxyPath = path.join(process.cwd(), 'data', this.PROXY_FILE);
      const content = await fs.readFile(proxyPath, 'utf-8');
      this.proxies = content.split(/\r?\n/).filter(line => line.trim().length > 0);
      Logger.success(`Loaded ${this.proxies.length} proxies`);
    } catch (error) {
      Logger.warning('No proxy file found or error loading proxies, continuing without proxies');
      this.proxies = [];
    }
  }

  public static getRandomProxy(): string | null {
    if (this.proxies.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * this.proxies.length);
    return this.proxies[randomIndex];
  }

  public static formatProxy(proxyString: string): string {
    // Format: ip:port:username:password -> username:password@ip:port
    const parts = proxyString.split(':');
    if (parts.length === 4) {
      const [ip, port, username, password] = parts;
      return `${username}:${password}@${ip}:${port}`;
    } else if (parts.length === 2) {
      // Format: ip:port
      return proxyString;
    }
    return proxyString;
  }

  public static parseProxy(proxyString: string): ProxyConfig | null {
    try {
      const parts = proxyString.split(':');
      if (parts.length === 4) {
        return {
          host: parts[0],
          port: parseInt(parts[1]),
          username: parts[2],
          password: parts[3],
        };
      } else if (parts.length === 2) {
        return {
          host: parts[0],
          port: parseInt(parts[1]),
        };
      }
      return null;
    } catch (error) {
      Logger.error('Failed to parse proxy:', proxyString);
      return null;
    }
  }
}