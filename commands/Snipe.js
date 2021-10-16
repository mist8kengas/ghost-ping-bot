module.exports = {
    name: 'snipe',
    description: 'Snipe last known deleted message in the current channel',
    permissions: ['SEND_MESSAGES'],
    usage: 'snipe',
    alias: ['s', 'last', 'lastmessage'],
    execute: async (data) => {
        const {msg} = data, embed = newEmbed().setTimestamp(), deletedMessage = deletedMessages.get(msg.channelId);

        if (deletedMessage && !deletedMessage.embeds[0]) {
            let attachment = deletedMessage.attachments.size > 0 ? deletedMessage.content + '\n' + deletedMessage.attachments.entries().next().value[1].url : undefined;

            embed.setTitle('Sniped a message!');
            embed.setThumbnail(deletedMessage.author.displayAvatarURL({format: 'png', dynamic: true}));
            embed.addFields([
                {name: 'User:', value: String(deletedMessage.author)},
                {name: 'Message:', value: attachment || deletedMessage.content}
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