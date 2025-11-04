import * as Captcha from '2captcha';
import { Logger } from '../utils/logger';
import config from '../config';

export class CaptchaSolver {
  private solver: any;

  constructor(apiKey?: string) {
    const key = apiKey || config.captcha.apiKey;
    this.solver = new Captcha.Solver(key);
  }

  public async solveHCaptcha(siteKey: string, domain: string): Promise<string> {
    try {
      Logger.info('Solving captcha... This may take a minute...');
      const result = await this.solver.hcaptcha(siteKey, domain);
      
      if (result.toString().includes('Bad gateway error:')) {
        throw new Error('Captcha service returned bad gateway error');
      }

      Logger.success(`Got Captcha - ${result.data.slice(-10)}`);
      return result.data;
    } catch (error) {
      Logger.error('Failed to solve captcha:', error);
      throw error;
    }
  }
}