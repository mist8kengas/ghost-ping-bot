import { Message, PartialMessage } from 'discord.js';
import { ExtendedClient } from '..';
import newEmbed from '../utils/embed.js';

export default function messageDelete(
    client: ExtendedClient,
    msg: Message | PartialMessage
) {
    if (!msg.author) return;
    if (msg.mentions.users.size > 0 && !msg.author.bot) {
        const embed = newEmbed();
        embed.setThumbnail(msg.author.displayAvatarURL({ format: 'png', dynamic: true }));
        embed.addFields([
            { name: 'User:', value: msg.author.toString() },
            {
                name: 'Mentioned:',
                value: msg.mentions.users.map((user) => user.toString()).join(' '),
            },
        ]);
        embed.setTimestamp();

        msg.channel.send({ embeds: [embed] }).catch((reason) => {
            console.error('[error]', reason);
        });
    }

    // add deleted message to the cache
    if (msg.author.id != client.user?.id)
        client.deletedMessages.set(msg.channelId, [msg, false]);
}
