import { REST, Routes } from 'discord.js';
import { commands } from './commands';
import { config } from './config';

const commandsData = Object.values(commands).map((command) => command.data);

const rest = new REST({ version: '10' }).setToken(config.DISCORD_TOKEN);

export async function deployCommands() {
  try {
    logger.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(config.DISCORD_CLIENT_ID), {
      body: commandsData
    });

    logger.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    logger.error(error);
  }
}
