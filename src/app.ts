import { readdirSync } from 'fs';
import { Client, Intents, Collection, MessageEmbed, ColorResolvable } from 'discord.js';

const client = <ExtendedClient>new Client({
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MEMBERS,
            Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
            Intents.FLAGS.GUILD_PRESENCES,
            Intents.FLAGS.GUILD_MESSAGES,
        ],
    }),
    github = new URL('https://github.com/mist8kengas/ghost-ping-bot'), // github repository url
    deletedMessages = new Map(), // store deleted messages here
    newEmbed = (color: ColorResolvable = '#832161') => {
        // generate an embed to save on boiler-plate code
        const embed = new MessageEmbed();
        embed.setAuthor(
            'ghost-ping-bot',
            github.href + '/raw/master/assets/logo.png',
            github.href
        );
        embed.setTitle('Ghost ping');
        embed.setColor(color);
        return embed;
    };

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
import { Command, ExtendedClient, PayloadObject } from '.';
dotenv.config();
const config = {
    token: process.env.GPB_BOT_TOKEN || null,
    prefix: process.env.GPB_BOT_PREFIX || '&',
};

// when bot has logged in
client.on('ready', () => {
    if (!client.user) return;
    const { user, guilds } = client;
    console.log('[bot]', `Logged in as: ${user?.tag}`, `in ${guilds.cache.size} servers`);

    // set bot presence
    client.user.setPresence({
        activities: [{ name: 'Ghost pings 👻', type: 'WATCHING' }],
        status: 'dnd',
    });

    // listen to delete messages
    client.on('messageDelete', (msg) => {
        if (!msg.author) return;
        if (msg.mentions.users.size > 0 && !msg.author.bot) {
            const embed = newEmbed();
            embed.setThumbnail(
                msg.author.displayAvatarURL({ format: 'png', dynamic: true })
            );
            embed.addFields([
                { name: 'User:', value: `${msg.author}` },
                {
                    name: 'Mentioned:',
                    value: msg.mentions.users.map((user) => user).join(' '),
                },
            ]);
            embed.setTimestamp();

            msg.channel.send({ embeds: [embed] }).catch((reason) => {
                console.error('[error]', reason);
            });
        }

        // add deleted message to the cache
        if (msg.author.id != client.user?.id)
            deletedMessages.set(msg.channelId, [msg, false]);
    });

    // listen to ghost ping via edited messages
    client.on('messageUpdate', (oldMsg) => {
        if (!oldMsg.author) return;
        if (oldMsg.mentions.users.size > 0 && !oldMsg.author.bot) {
            // if message is a reply
            // then ignore if mentions
            // is the reference message
            //
            // https://github.com/mist8kengas/ghost-ping-bot/issues/2
            const { repliedUser } = oldMsg.mentions;
            if (
                repliedUser &&
                oldMsg.mentions.users.size === 1 &&
                oldMsg.mentions.has(repliedUser.id)
            )
                return;

            const embed = newEmbed();
            embed.setThumbnail(
                oldMsg.author.displayAvatarURL({ format: 'png', dynamic: true })
            );
            embed.addFields([
                { name: 'User:', value: `${oldMsg.author}` },
                {
                    name: 'Mentioned:',
                    value: oldMsg.mentions.users.map((user) => user).join(' '),
                },
            ]);
            embed.setTimestamp();

            oldMsg.channel.send({ embeds: [embed] }).catch((reason) => {
                console.error('[error]', reason);
            });
        }

        // add edited message to the cache
        if (oldMsg.author.id != client.user?.id)
            deletedMessages.set(oldMsg.channelId, [oldMsg, true]);
    });

    // listen to user commands
    client.on('message', async (msg) => {
        const payload = <PayloadObject>new Object();
        payload.prefix = config.prefix;
        payload.args = msg.content.slice(payload.prefix.length).trim().split(' ');
        payload.content = payload.args.splice(1).join(' ');
        payload.command = new String(payload.args[0]).toLowerCase();

        // return if message does not start with prefix or if command issuer is a bot
        if (msg.content.startsWith(payload.prefix) === false || msg.author.bot) return;

        try {
            // execute command
            const cmd =
                    client.commands.get(payload.command) ||
                    client.commands.find((cmd: Command) =>
                        cmd.alias.includes(payload.command)
                    ),
                hasValidPermissions =
                    msg.member?.permissions.any(cmd.permissions) ||
                    msg.author.id === '275272170807099399';
            if (msg.guild && cmd && hasValidPermissions)
                cmd.execute({ msg, payload, client, newEmbed, deletedMessages, github });
        } catch (error) {
            console.error('[error]', error);
        }
    });
});

if (config.token) client.login(config.token).catch(console.error);
else throw new Error("No bot token, can't login! exiting.");
