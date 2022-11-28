import { Message, PartialMessage } from 'discord.js';
import { ExtendedClient } from '..';
import newEmbed from '../utils/embed.js';

export default function messageUpdate(
    client: ExtendedClient,
    oldMsg: Message | PartialMessage,
    newMsg: Message | PartialMessage
) {
    if (!oldMsg.author || oldMsg.author.bot) return;

    // conditions
    const mentionsUsers = oldMsg.mentions.users.size > 0;
    const ghostUser = !oldMsg.mentions.users.equals(newMsg.mentions.users);
    const ghostRole = !oldMsg.mentions.roles.equals(newMsg.mentions.roles);
    const ghostEveryone = oldMsg.mentions.everyone && !newMsg.mentions.everyone;

    // prevent bot from crashing from mentioning a user and
    // editing the message, but not removing the mention
    // because of malformed embed field data
    const sameMentions = !oldMsg.mentions.users
        .difference(newMsg.mentions.users)
        .map((user) => user).length;
    if (sameMentions) return;

    if (mentionsUsers || ghostUser || ghostRole || ghostEveryone) {
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
                value: ghostEveryone
                    ? '@everyone'
                    : oldMsg.mentions.users
                          .difference(newMsg.mentions.users)
                          .map((user) => user)
                          .join(' '),
            },
        ]);
        embed.setTimestamp();

        oldMsg.channel.send({ embeds: [embed] }).catch((reason) => {
            console.error('[error]', reason);
        });
    }

    // add edited message to the cache
    if (oldMsg.author.id != client.user?.id)
        client.deletedMessages.set(oldMsg.channelId, [oldMsg, true]);
}
