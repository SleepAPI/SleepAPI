import { Client, GatewayIntentBits } from 'discord.js';
import type { Application, Request, Response } from 'express';
import express from 'express';
import morgan from 'morgan';
import { commands } from './commands';
import { config } from './config';
import { deployCommands } from './deploy-commands';

// API
const app: Application = express();
const port = config.PORT ?? 3000;
app.use(express.json());
app.use(morgan('tiny'));
app.get('/', (req: Request, res: Response) => {
  try {
    res.send('Sleep API Bot is a Discord bot for Sleep API');
  } catch (err) {
    logger.error(err as Error);
    res.status(500).send('Something went wrong');
  }
});
app.get('/health', (req: Request, res: Response) => {
  try {
    res.header('Content-Type', 'application/json').send(JSON.stringify({ status: 'healthy' }, null, 4));
  } catch (err) {
    logger.error(err as Error);
    res.status(500).send('Something went wrong');
  }
});
logger.info('⚡️[info]: starting API');
app.listen(port, async () => {
  logger.log(`API is running at ${port}`);
});

// DISCORD
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages
  ]
});

// At startup register commands
client.once('ready', async () => {
  logger.log('Discord bot is ready! 🤖');
  await deployCommands();
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }
  const { commandName } = interaction;
  if (commands[commandName as keyof typeof commands]) {
    commands[commandName as keyof typeof commands].execute(interaction);
  }
});

client.login(config.DISCORD_TOKEN);
