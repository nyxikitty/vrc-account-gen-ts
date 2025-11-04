import { CommandInteraction } from 'discord.js';

export interface Config {
  captchaKey: string;
  usernameList: string[];
  useUsernameList: boolean;
  randomUsername: boolean;
  useSpecialCharacters: boolean;
  siteKey: string;
  domain: string;
}

export interface VRChatAccount {
  username: string;
  password: string;
  email: string;
  userId?: string;
  authToken?: string;
  displayName?: string;
}

export interface AccountRegistrationPayload {
  username: string;
  password: string;
  email: string;
  year: number;
  month: number;
  day: number;
  captchaCode: string;
  subscribe: boolean;
  AcceptedTOSVersion: number;
}

export interface VRChatAPIResponse {
  id: string;
  displayName: string;
  authToken: string;
  message?: string;
}

export interface UserData {
  accountsGenerated: number;
  day: number;
}

export interface UserDatabase {
  [userId: string]: UserData;
}

export interface EmailConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  tls: boolean;
}

export interface ProxyConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
}

export enum LogLevel {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  WARNING = 'WARNING'
}

export interface GenerationOptions {
  captchaKey: string;
  interaction: CommandInteraction;
  proxy?: string;
}