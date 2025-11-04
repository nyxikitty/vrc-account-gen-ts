import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { Logger } from '../utils/logger';
import { UsernameGenerator } from '../utils/username';
import { ProxyManager } from '../utils/proxy';
import { CaptchaSolver } from './captcha';
import { EmailService } from './email';
import config from '../config';
import {
  VRChatAccount,
  AccountRegistrationPayload,
  VRChatAPIResponse,
  GenerationOptions,
} from '../types';

export class VRChatAccountGenerator {
  private captchaSolver: CaptchaSolver;
  private emailService: EmailService;

  constructor() {
    this.captchaSolver = new CaptchaSolver();
    this.emailService = new EmailService();
  }

  public async generateAccount(options: GenerationOptions): Promise<VRChatAccount> {
    const { captchaKey, interaction } = options;
    
    try {
      const username = this.generateUsername();
      const password = UsernameGenerator.generatePassword();
      const email = UsernameGenerator.generateEmail(config.emailDomain);

      Logger.info(`Generating account for username: ${username}`);

      const proxyString = ProxyManager.getRandomProxy();
      const proxyUrl = proxyString ? `http://${ProxyManager.formatProxy(proxyString)}` : null;

      if (proxyUrl) {
        Logger.info(`Using proxy - ${proxyUrl}`);
      } else {
        Logger.warning('No proxy available, proceeding without proxy');
      }

      const captchaCode = await this.captchaSolver.solveHCaptcha(
        config.vrchat.siteKey,
        config.vrchat.domain
      );

      const account = await this.registerAccount(
        username,
        password,
        email,
        captchaCode,
        proxyUrl
      );

      Logger.success('Account created successfully!');
      Logger.info('Verifying email...');

      await this.verifyAccountEmail(account);

      return account;
    } catch (error) {
      Logger.error('Account generation failed:', error);
      throw error;
    }
  }

  private generateUsername(): string {
    const baseUsername = UsernameGenerator.generate(11);
    const useSpecialChars = config.getConfig().useSpecialCharacters;
    
    return useSpecialChars 
      ? UsernameGenerator.applySpecialCharacters(baseUsername)
      : baseUsername;
  }

  private async registerAccount(
    username: string,
    password: string,
    email: string,
    captchaCode: string,
    proxyUrl: string | null
  ): Promise<VRChatAccount> {
    const payload: AccountRegistrationPayload = {
      username,
      password,
      email,
      year: 2000,
      month: Math.floor(Math.random() * 12) + 1,
      day: Math.floor(Math.random() * 28) + 1,
      captchaCode,
      subscribe: true,
      AcceptedTOSVersion: 8,
    };

    const fetchOptions: any = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
        'Origin': 'https://vrchat.com',
      },
      body: JSON.stringify(payload),
    };

    if (proxyUrl) {
      fetchOptions.agent = new HttpsProxyAgent(proxyUrl);
    }

    const response = await fetch(
      `https://vrchat.com/api/1/auth/register?apiKey=${config.vrchat.apiKey}`,
      fetchOptions
    );

    const text = await response.text();

    if (text.includes('<')) {
      throw new Error('Received HTML response instead of JSON, possibly blocked');
    }

    const data: VRChatAPIResponse = JSON.parse(text);

    if (data.message) {
      if (data.message === 'username did not pass sanitization') {
        throw new Error('Username did not pass sanitization');
      }
      if (data.message === 'Username or email already exists!') {
        throw new Error('Username or email already exists');
      }
      if (data.message.includes('email address is not allowed')) {
        throw new Error('Email domain is banned');
      }
      if (data.message.includes('must be a valid email')) {
        throw new Error('Email must be valid');
      }
      throw new Error(data.message);
    }

    return {
      username: data.displayName,
      password,
      email,
      userId: data.id,
      authToken: data.authToken,
      displayName: data.displayName,
    };
  }

  private async verifyAccountEmail(account: VRChatAccount): Promise<void> {
    try {
      await this.emailService.waitForVerificationEmail(account.displayName!);
      Logger.success('[✔] Account Verification Success!');
    } catch (error) {
      Logger.error('Email verification failed:', error);
      throw error;
    }
  }

  public async get2AuthCode(username: string): Promise<string> {
    try {
      const code = await this.emailService.waitFor2AuthCode(username);
      return code;
    } catch (error) {
      Logger.error('Failed to get 2auth code:', error);
      throw error;
    }
  }

  public async verifyLoginLocation(username: string): Promise<void> {
    try {
      await this.emailService.waitForLoginVerification(username);
    } catch (error) {
      Logger.error('Failed to verify login location:', error);
      throw error;
    }
  }
}