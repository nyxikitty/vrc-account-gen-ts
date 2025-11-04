declare module '2captcha' {
  export interface CaptchaResult {
    data: string;
    id: string;
  }

  export class Solver {
    constructor(apiKey: string, timeout?: number, polling?: number, throwErrors?: boolean);
    
    hcaptcha(sitekey: string, pageurl: string, options?: any): Promise<CaptchaResult>;
    recaptcha(sitekey: string, pageurl: string, options?: any): Promise<CaptchaResult>;
    image(body: Buffer | string, options?: any): Promise<CaptchaResult>;
    
    balance(): Promise<number>;
  }
}