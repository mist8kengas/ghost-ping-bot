import { Command } from '..';
import { SlashCommandBuilder } from '@discordjs/builders';
import newEmbed from '../utils/embed.js';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('snipe')
        .setDescription('Snipe last known deleted message in the current channel'),
    name: 'snipe',
    description: 'Snipe last known deleted message in the current channel',
    usage: 'snipe',
    execute: async ({ interaction, externals: { deletedMessages, github } }) => {
        if (!interaction.inGuild()) return;

        const channelId = interaction.channelId || '';

        const embed = newEmbed().setTimestamp(),
            [deletedMessage, edited] = deletedMessages.get(channelId) || [undefined];

        if (!deletedMessages.get(channelId)) {
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
                { name: 'Message:', value: String(attachment || content) },
            ]);
        }

        await interaction.reply({ embeds: [embed] });
    },
};
export default command;
