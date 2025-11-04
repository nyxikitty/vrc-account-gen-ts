import * as dotenv from 'dotenv';
import { Config, EmailConfig } from '.';

dotenv.config();

export class ConfigManager {
  private static instance: ConfigManager;

  public readonly discord = {
    token: process.env.DISCORD_TOKEN || '',
    guildId: process.env.GUILD_ID || '',
    roleId: process.env.ROLE_ID || '',
    adminRoleId: process.env.ADMIN_ROLE_ID || '',
  };

  public readonly vrchat = {
    apiKey: process.env.VRCHAT_API_KEY || 'JlE5Jldo5Jibnk5O5hTx6XVqsJu4WJ26',
    siteKey: process.env.VRCHAT_SITE_KEY || '',
    domain: process.env.VRCHAT_DOMAIN || 'vrchat.com',
  };

  public readonly captcha = {
    apiKey: process.env.CAPTCHA_API_KEY || '',
  };

  public readonly email: EmailConfig = {
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    host: process.env.EMAIL_HOST || '',
    port: parseInt(process.env.EMAIL_PORT || '993'),
    tls: true,
  };

  public readonly emailDomain = process.env.EMAIL_DOMAIN || '@example.com';

  public readonly rateLimit = {
    dailyAccountLimit: parseInt(process.env.DAILY_ACCOUNT_LIMIT || '3'),
  };

  private constructor() {
    this.validateConfig();
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private validateConfig(): void {
    const required = [
      { key: 'DISCORD_TOKEN', value: this.discord.token },
      { key: 'CAPTCHA_API_KEY', value: this.captcha.apiKey },
      { key: 'EMAIL_USER', value: this.email.user },
      { key: 'EMAIL_PASSWORD', value: this.email.password },
      { key: 'EMAIL_HOST', value: this.email.host },
    ];

    const missing = required.filter(({ value }) => !value);
    if (missing.length > 0) {
      console.warn(
        'Warning: Missing required environment variables:',
        missing.map(({ key }) => key).join(', ')
      );
    }
  }

  public getConfig(): Config {
    return {
      captchaKey: this.captcha.apiKey,
      usernameList: [],
      useUsernameList: false,
      randomUsername: true,
      useSpecialCharacters: false,
      siteKey: this.vrchat.siteKey,
      domain: this.vrchat.domain,
    };
  }
}

export default ConfigManager.getInstance();