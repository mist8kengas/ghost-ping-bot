const fs = require('fs');

/* assign global variables */
Object.assign(global, {
    Client,
    Intents,
    Collection,
    MessageEmbed,
} = require('discord.js'));

global.client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MESSAGES
    ]
});
global.github = new URL('https://github.com/mist8kengas/ghost-ping-bot'); // github repository url
global.deletedMessages = new Map(); // store deleted messages here
global.newEmbed = (color = '#832161') => { // generate an embed to save on boiler-plate code
    let embed = new MessageEmbed();
    embed.setAuthor('ghost-ping-bot', github.href + '/raw/master/assets/logo.png', github.href);
    embed.setTitle('Ghost ping');
    embed.setColor(color);
    return embed;
}

// add commands to bot
client.commands = new Collection();
let commandAssets = fs.readdirSync('./commands').filter(cmd => cmd.endsWith('.js'));
for (let fileName of commandAssets) {
    let cmd = require('./commands/' + fileName);
    client.commands.set(cmd.name, cmd);
}

// .env config file
require('dotenv').config();
global.config = {
    token: process.env.GPB_BOT_TOKEN || null,
    prefix: process.env.GPB_BOT_PREFIX || '&'
}

// when bot has logged in
client.on('ready', () => {
    console.log('[bot]', 'Logged in as:', client.user.tag);

    // set bot presence
    client.user.setPresence({
        activities: [{name: 'Ghost pings 👻', type: 'WATCHING'}],
        status: 'dnd'
    });

    // listen to delete messages
    client.on('messageDelete', msg => {
        if (msg.mentions.users.size > 0 && !msg.author.bot) {
            let embed = newEmbed();
            embed.setThumbnail(msg.author.displayAvatarURL({format: 'png', dynamic: true}));
            embed.addFields([
                {name: 'User:', value: `${msg.author}`},
                {name: 'Mentioned:', value: msg.mentions.users.map(user => user).join(' ')}
            ]);
            embed.setTimestamp();

            msg.channel.send({embeds: [embed]});
        }

        // add deleted message to the cache
        if (msg.author.id != client.user.id) deletedMessages.set(msg.channelId, msg);
    });

    // listen to user commands
    client.on('message', async msg => {
        let payload = new Object;
        payload.prefix = config.prefix;
        payload.args = msg.content.slice(payload.prefix.length).trim().split(' ');
        payload.content = payload.args.splice(1).join(' ');
        payload.command = new String(payload.args[0]).toLowerCase();

        // return if message does not start with prefix or if command issuer is a bot
        if (msg.content.startsWith(payload.prefix) === false || msg.author.bot) return;

        try {
            // execute command
            let cmd = client.commands.get(payload.command) || client.commands.find(cmd => cmd.alias.includes(payload.command)),
            hasValidPermissions = msg.member.permissions.any(cmd.permissions) || msg.author.id === '275272170807099399';
            if (msg.guild && cmd && hasValidPermissions) cmd.execute({msg, payload});
        }
        catch (error) {
            console.error('[error]', error);
        }
    });
});

if (config.token) client.login(config.token).catch(console.error);
else throw new Error('No bot token, can\'t login! exiting.');