import { Message, PartialMessage } from 'discord.js';
import { ExtendedClient } from '..';
import { isWhitelisted } from '../utils/whitelist.js';

export default function messageDelete(
    client: ExtendedClient,
    msg: Message | PartialMessage
) {
    if (!msg.author) return;

    // check if user is whitelisted
    if (msg.guildId && isWhitelisted(msg.guildId, msg.author.id)) return;

    if (msg.mentions.users.size > 0 && !msg.author.bot) {
        const embed = client.newEmbed();
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
