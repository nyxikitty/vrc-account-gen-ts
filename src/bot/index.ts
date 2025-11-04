import {
  Client,
  CommandInteraction,
  EmbedBuilder,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
} from 'discord.js';
import { VRChatAccountGenerator } from '../services/vrchat';
import { UserDatabaseManager } from '../database/userDB';
import { ProxyManager } from '../utils/proxy';
import { Logger } from '../utils/logger';
import config from '../config';
import * as fs from 'fs/promises';
import * as path from 'path';

export class DiscordBot {
  private client: Client;
  private generator: VRChatAccountGenerator;
  private userDB: UserDatabaseManager;
  private accountsFilePath: string;

  constructor() {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    });

    this.generator = new VRChatAccountGenerator();
    this.userDB = UserDatabaseManager.getInstance();
    this.accountsFilePath = path.join(process.cwd(), 'data', 'GeneratedAccounts.txt');
  }

  public async start(): Promise<void> {
    await this.initialize();
    await this.registerCommands();
    this.setupEventHandlers();
    await this.client.login(config.discord.token);
  }

  private async initialize(): Promise<void> {
    await this.userDB.load();
    await ProxyManager.loadProxies();
    await fs.mkdir(path.dirname(this.accountsFilePath), { recursive: true });
  }

  private async registerCommands(): Promise<void> {
    const commands = [
      new SlashCommandBuilder()
        .setName('account')
        .setDescription('Generate a new VRChat account'),
      
      new SlashCommandBuilder()
        .setName('2auth')
        .setDescription('Get 2FA code for an account')
        .addStringOption(option =>
          option.setName('username')
            .setDescription('The VRChat username')
            .setRequired(true)
        ),
      
      new SlashCommandBuilder()
        .setName('loginlocation')
        .setDescription('Verify login location for an account')
        .addStringOption(option =>
          option.setName('username')
            .setDescription('The VRChat username')
            .setRequired(true)
        ),
      
      new SlashCommandBuilder()
        .setName('help')
        .setDescription('List available commands'),
    ].map(command => command.toJSON());

    const rest = new REST({ version: '10' }).setToken(config.discord.token);

    try {
      Logger.info('Registering slash commands...');
      await rest.put(
        Routes.applicationCommands(this.client.user?.id || ''),
        { body: commands }
      );
      Logger.success('Successfully registered slash commands');
    } catch (error) {
      Logger.error('Failed to register slash commands:', error);
    }
  }

  private setupEventHandlers(): void {
    this.client.once('ready', () => {
      Logger.success(`Logged in as ${this.client.user?.tag}`);
      this.setActivity();
    });

    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isCommand()) return;
      await this.handleCommand(interaction);
    });
  }

  private setActivity(): void {
    setInterval(() => {
      this.client.user?.setActivity('Watching the souls...');
    }, 60000);
  }

  private async handleCommand(interaction: CommandInteraction): Promise<void> {
    const { commandName } = interaction;

    // Check if user has required role
    if (!this.hasRequiredRole(interaction)) {
      await interaction.reply({
        content: 'You do not have permission to use this command.',
        ephemeral: true,
      });
      return;
    }

    try {
      switch (commandName) {
        case 'account':
          await this.handleAccountCommand(interaction);
          break;
        case '2auth':
          await this.handle2AuthCommand(interaction);
          break;
        case 'loginlocation':
          await this.handleLoginLocationCommand(interaction);
          break;
        case 'help':
          await this.handleHelpCommand(interaction);
          break;
      }
    } catch (error) {
      Logger.error(`Error handling ${commandName} command:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(`❌ Error: ${errorMessage}`);
      } else {
        await interaction.reply({ content: `❌ Error: ${errorMessage}`, ephemeral: true });
      }
    }
  }

  private async handleAccountCommand(interaction: CommandInteraction): Promise<void> {
    // Check rate limit
    const canGenerate = this.userDB.canGenerateAccount(
      interaction.user.id,
      config.rateLimit.dailyAccountLimit
    );

    if (!canGenerate) {
      await interaction.reply({
        content: "You've reached your daily limit of account generation! Check back tomorrow!",
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply('Generating account, this may take a minute due to captcha solving...');

    try {
      const account = await this.generator.generateAccount({
        captchaKey: config.captcha.apiKey,
        interaction,
      });

      // Save to file
      const accountInfo = `Username: ${account.username} | Password: ${account.password} | Email: ${account.email} | UserID: ${account.userId} | AuthToken: ${account.authToken}\n`;
      await fs.appendFile(this.accountsFilePath, accountInfo);

      // Send to user DM
      const embed = new EmbedBuilder()
        .setTitle('Account Generated')
        .setDescription(`\`\`\`${accountInfo}\`\`\``)
        .setColor(0x00ff00)
        .setTimestamp();

      await interaction.user.send({ embeds: [embed] });
      await interaction.editReply('Account generated! Check your DMs!');

      // Increment counter
      await this.userDB.incrementAccountGeneration(interaction.user.id);
    } catch (error) {
      Logger.error('Account generation failed:', error);
      throw error;
    }
  }

  private async handle2AuthCommand(interaction: CommandInteraction): Promise<void> {
    const username = interaction.options.get('username', true).value as string;

    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply('Looking for 2FA code...');

    try {
      const code = await this.generator.get2AuthCode(username);

      const embed = new EmbedBuilder()
        .setTitle('2FA Code')
        .setDescription(`Here's your one-time code: \`${code}\``)
        .setColor(0x00ff00)
        .setTimestamp();

      await interaction.user.send({ embeds: [embed] });
      await interaction.editReply('Found 2FA code! Check your DMs!');
    } catch (error) {
      Logger.error('Failed to get 2FA code:', error);
      throw error;
    }
  }

  private async handleLoginLocationCommand(interaction: CommandInteraction): Promise<void> {
    const username = interaction.options.get('username', true).value as string;

    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply('Looking for login verification...');

    try {
      await this.generator.verifyLoginLocation(username);

      const embed = new EmbedBuilder()
        .setTitle('Login Location')
        .setDescription('Your login was verified!')
        .setColor(0x00ff00)
        .setTimestamp();

      await interaction.user.send({ embeds: [embed] });
      await interaction.editReply('Login verified! Check your DMs!');
    } catch (error) {
      Logger.error('Failed to verify login location:', error);
      throw error;
    }
  }

  private async handleHelpCommand(interaction: CommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle('Available Commands')
      .setDescription('Here are the commands you can use:')
      .addFields(
        { name: '/account', value: 'Generate a new VRChat account', inline: false },
        { name: '/2auth <username>', value: 'Get 2FA code for an account', inline: false },
        { name: '/loginlocation <username>', value: 'Verify login location for an account', inline: false },
        { name: '/help', value: 'Show this help message', inline: false }
      )
      .setColor(0x0099ff)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  private hasRequiredRole(interaction: CommandInteraction): boolean {
    const member = interaction.member;
    if (!member || !('roles' in member)) return false;
    
    const roles = member.roles;
    if ('cache' in roles) {
      return roles.cache.has(config.discord.roleId);
    }
    
    return false;
  }
}