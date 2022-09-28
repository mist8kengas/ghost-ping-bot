import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

// .env config file
import * as dotenv from 'dotenv';
dotenv.config();
const config = {
    token: process.env.GPB_BOT_TOKEN || '',
    clientId: process.env.GPB_BOT_ID || '',
};

import { readdirSync } from 'fs';
const commands: SlashCommandBuilder[] = new Array();

import { join } from 'path';
const commandsPath = join('./build', 'commands');

const commandFiles = readdirSync(commandsPath).filter((fileName) =>
    fileName.endsWith('.js')
);
for (const file of commandFiles) {
    const { default: command } = await import(`../commands/${file}`);
    commands.push(command.data.toJSON());
}

// add commands
const rest = new REST({ version: '9' }).setToken(config.token);

// register global commands
rest.put(Routes.applicationCommands(config.clientId), { body: commands })
    .then(() => console.log('[rest:put]', `Added ${commands.length} commands`))
    .catch((error: Error) => console.error('[rest:put:error]', error));
