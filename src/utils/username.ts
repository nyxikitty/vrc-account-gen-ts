export class UsernameGenerator {
  private static readonly SPECIAL_CHAR_MAP: Record<string, string[]> = {
    a: ['а'],
    c: ['с'],
    d: ['ԁ'],
    e: ['е'],
    i: ['і'],
    o: ['о', 'ο', 'օ'],
    p: ['р'],
    x: ['х'],
    u: ['ս'],
    y: ['у'],
  };

  private static readonly CHARSET = 'abcdefghijklmnopqrstuvwxyz0123456789';

  public static generate(length: number = 11): string {
    let username = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * this.CHARSET.length);
      username += this.CHARSET[randomIndex];
    }
    return username;
  }

  public static applySpecialCharacters(username: string): string {
    let modified = username;
    for (const [char, replacements] of Object.entries(this.SPECIAL_CHAR_MAP)) {
      const replacement = replacements[Math.floor(Math.random() * replacements.length)];
      modified = modified.replaceAll(char, replacement);
    }
    return modified;
  }

  public static generatePassword(length: number = 12): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return `${password}.${this.generate(5)}@`;
  }

  public static generateEmail(domain: string): string {
    const part1 = Math.floor(Math.random() * 600000000000);
    const part2 = Math.floor(Math.random() * 600000000000);
    return `${part1}.${part2}${domain}`;
  }
}