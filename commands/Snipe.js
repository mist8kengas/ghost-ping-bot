module.exports = {
    name: 'snipe',
    description: 'Snipe last known deleted message in the current channel',
    permissions: ['SEND_MESSAGES'],
    usage: 'snipe',
    alias: ['s', 'last', 'lastmessage'],
    execute: async data => {
        let {msg} = data,
        deletedMessage = deletedMessages.get(msg.channelId),
        embed = newEmbed().setTimestamp();

        if (deletedMessage && !deletedMessage.embeds[0]) {
            embed.setTitle('Sniped a message!');
            embed.setThumbnail(deletedMessage.author.displayAvatarURL({format: "png", dynamic: true}));
            embed.addFields([
                {name: 'User:', value: `${deletedMessage.author}`},
                {name: 'Message:', value: deletedMessage.content || deletedMessage.attachments.entries().next().value[1].url}
            ]);
        }
        else {
            embed.setTitle('Sniping error');
            embed.setThumbnail(github.href + '/raw/master/assets/warning.png');
            embed.setDescription('Cannot snipe any messages in this channel!');
        }

        msg.reply({embeds: [embed]});
    }
}