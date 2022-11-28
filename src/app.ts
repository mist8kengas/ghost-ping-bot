import { readdirSync } from 'fs';
import {
    Client,
    Intents,
    Collection,
    Interaction,
    Message,
    PartialMessage,
    ColorResolvable,
} from 'discord.js';
import { ExtendedClient } from '.';

// import utils
import newEmbed from './utils/embed.js';

// handlers
import messageDelete from './handlers/messageDelete.js';
import messageUpdate from './handlers/messageUpdate.js';
import interactionCreate from './handlers/interactionCreate.js';

// import version number from package.json
import { readFileSync } from 'fs';
const { version: PACKAGE_VERSION } = JSON.parse(
    readFileSync('./package.json', { encoding: 'utf8' })
);

const client = <ExtendedClient>new Client({
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MEMBERS,
            Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
            Intents.FLAGS.GUILD_PRESENCES,
            Intents.FLAGS.GUILD_MESSAGES,
        ],
    }),
    github = new URL('https://github.com/mist8kengas/ghost-ping-bot'); // github repository url

client.version = PACKAGE_VERSION;
client.deletedMessages = new Map<string, [Message | PartialMessage, boolean]>(); // store deleted messages here
client.newEmbed = (color?: ColorResolvable) => newEmbed(client, color);

// add commands to bot
client.commands = new Collection();
const commandAssets = readdirSync('./build/commands').filter((cmd) =>
    cmd.endsWith('.js')
);
for (const fileName of commandAssets) {
    const { default: cmd } = await import('./commands/' + fileName);
    client.commands.set(cmd.name, cmd);
}

// .env config file
import * as dotenv from 'dotenv';
dotenv.config();
const config = {
    token: process.env.GPB_BOT_TOKEN || null,
    prefix: process.env.GPB_BOT_PREFIX || '&',
};

// when bot has logged in
client.once('ready', () => {
    if (!client.user) return;
    const { user, guilds } = client;
    console.log('[bot]', `Logged in as: ${user?.tag}`, `in ${guilds.cache.size} servers`);

    // set bot presence
    client.user.setPresence({
        activities: [{ name: 'Ghost pings 👻', type: 'WATCHING' }],
        status: 'dnd',
    });

    // listen to delete messages
    client.on('messageDelete', (msg) => messageDelete(client, msg));

    // listen to ghost ping via edited messages
    client.on(
        'messageUpdate',
        (oldMsg: Message | PartialMessage, newMsg: Message | PartialMessage) =>
            messageUpdate(client, oldMsg, newMsg)
    );

    // listen to user commands
    client.on('interactionCreate', (interaction: Interaction) => {
        if (interaction.isCommand())
            interactionCreate(client, interaction, {
                deletedMessages: client.deletedMessages,
                github,
            });
    });
});

if (config.token) client.login(config.token).catch(console.error);
else throw new Error("No bot token, can't login! exiting.");
