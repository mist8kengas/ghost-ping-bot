import { CommandPayload } from '..';

export default {
    name: 'snipe',
    description: 'Snipe last known deleted message in the current channel',
    permissions: ['SEND_MESSAGES'],
    usage: 'snipe',
    alias: ['s', 'last', 'lastmessage'],
    execute: async (data: CommandPayload) => {
        const { msg, newEmbed, deletedMessages, github } = data,
            embed = newEmbed().setTimestamp(),
            [deletedMessage, edited] = deletedMessages.get(msg.channelId) || [undefined];

        if (!deletedMessages.get(msg.channelId)) {
            embed.setTitle('Sniping error');
            embed.setThumbnail(github.href + '/raw/master/assets/warning.png');
            embed.setDescription('Cannot snipe any messages in this channel!');
        } else if (deletedMessage && !deletedMessage.embeds[0]) {
            const { attachments, author, content } = deletedMessage;
            const attachment =
                attachments.size > 0
                    ? content + '\n' + attachments.entries().next().value[1].url
                    : undefined;

            embed.setTitle(edited ? 'Sniped an edited message!' : 'Sniped a message!');
            embed.setThumbnail(
                author?.displayAvatarURL({ format: 'png', dynamic: true }) || ''
            );
            embed.addFields([
                { name: 'User:', value: String(author) },
                { name: 'Message:', value: attachment || content },
            ]);
        }

        msg.reply({ embeds: [embed] }).catch((reason) => {
            console.error('[error]', reason);
        });
    },
};
