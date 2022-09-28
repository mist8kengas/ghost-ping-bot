import { Command } from '..';
import { SlashCommandBuilder } from '@discordjs/builders';
import newEmbed from '../utils/embed.js';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Display commands and their uses'),
    name: 'help',
    description: 'Display commands and their uses',
    usage: 'help',
    execute: async ({ client, interaction }) => {
        if (!interaction.inGuild()) return;

        const embed = newEmbed().setTimestamp().setTitle('Commands list');

        client.commands.map((cmd: Command, cmdName: string) =>
            embed.addFields({
                name: cmdName,
                value:
                    `> **Description:** ${cmd.description}\n` +
                    `> **Usage:** ${cmd.usage}\n`,
                inline: false,
            })
        );

        await interaction.reply({ embeds: [embed] });
    },
};
export default command;
