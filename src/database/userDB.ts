import * as fs from 'fs/promises';
import * as path from 'path';
import { UserDatabase, UserData } from '../types';
import { Logger } from '../utils/logger';

export class UserDatabaseManager {
  private static instance: UserDatabaseManager;
  private readonly dbPath: string;
  private database: UserDatabase = {};

  private constructor() {
    this.dbPath = path.join(process.cwd(), 'data', 'userDB.json');
  }

  public static getInstance(): UserDatabaseManager {
    if (!UserDatabaseManager.instance) {
      UserDatabaseManager.instance = new UserDatabaseManager();
    }
    return UserDatabaseManager.instance;
  }

  public async load(): Promise<void> {
    try {
      const data = await fs.readFile(this.dbPath, 'utf-8');
      this.database = JSON.parse(data);
      Logger.success('User database loaded');
    } catch (error) {
      Logger.warning('No existing database found, creating new one');
      this.database = {};
      await this.save();
    }
  }

  public async save(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.dbPath), { recursive: true });
      await fs.writeFile(this.dbPath, JSON.stringify(this.database, null, 2));
    } catch (error) {
      Logger.error('Failed to save user database:', error);
    }
  }

  public getUserData(userId: string): UserData {
    if (!this.database[userId]) {
      const today = new Date();
      this.database[userId] = {
        accountsGenerated: 0,
        day: today.getDate(),
      };
    }
    return this.database[userId];
  }

  public async incrementAccountGeneration(userId: string): Promise<void> {
    const userData = this.getUserData(userId);
    const today = new Date();
    const currentDay = today.getDate();

    // Reset counter if it's a new day
    if (userData.day !== currentDay) {
      userData.accountsGenerated = 0;
      userData.day = currentDay;
    }

    userData.accountsGenerated += 1;
    await this.save();
  }

  public canGenerateAccount(userId: string, dailyLimit: number): boolean {
    const userData = this.getUserData(userId);
    const today = new Date();
    const currentDay = today.getDate();

    // Allow generation if it's a new day
    if (userData.day !== currentDay) {
      return true;
    }

    return userData.accountsGenerated < dailyLimit;
  }

  public getAccountsGeneratedToday(userId: string): number {
    const userData = this.getUserData(userId);
    const today = new Date();
    const currentDay = today.getDate();

    if (userData.day !== currentDay) {
      return 0;
    }

    return userData.accountsGenerated;
  }
}

export default UserDatabaseManager.getInstance();