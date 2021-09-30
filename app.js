const {
    Client,
    Intents,
    MessageEmbed
} = require('discord.js');

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MESSAGES
    ]
}),
github = new URL('https://github.com/mist8kengas/ghost-ping-bot');

// .env config file
require('dotenv').config();
global.config = {
    token: process.env.GPB_BOT_TOKEN || null
};

client.on('ready', () => {
    console.log('[bot]', 'Logged in as:', client.user.tag);

    // set bot presence
    client.user.setPresence({
        activities: {name: 'Ghost pings 👻', type: 'WATCHING'},
        status: 'dnd'
    });

    // listen to delete messages
    client.on('messageDelete', msg => {
        if (msg.mentions.users.size > 0) {
            let embed = new MessageEmbed();
            embed.setAuthor('ghost-ping-bot', github.href + '/raw/master/assets/logo.png', github.href);
            embed.setTitle('Ghost ping');
            embed.setColor('#832161');
            embed.setThumbnail(msg.author.displayAvatarURL({format: "png", dynamic: true}));
            embed.addFields([
                {name: 'User:', value: `${msg.author}`},
                {name: 'Mentioned:', value: msg.mentions.users.map(user => user).join(' ')}
            ]);
            embed.setTimestamp();

            msg.channel.send({embeds: [embed]});
        }
    });
});

if (config.token) client.login(config.token).catch(console.error);
else console.error('[bot]', 'No bot token, can\'t login! exiting.');