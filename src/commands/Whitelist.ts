import { Command } from '..';
import { SlashCommandBuilder } from '@discordjs/builders';
import * as whitelist from '../utils/whitelist.js';
import { Permissions } from 'discord.js';

const command: Command = {
    data: new SlashCommandBuilder()
        .setName('whitelist')
        .setDescription('Manage user whitelist for sniping')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('add')
                .setDescription('Add a user to the whitelist')
                .addUserOption((option) =>
                    option
                        .setName('user')
                        .setDescription('The user to whitelist')
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('remove')
                .setDescription('Remove a user from the whitelist')
                .addUserOption((option) =>
                    option
                        .setName('user')
                        .setDescription('The user to remove')
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand.setName('list').setDescription('List all whitelisted users')
        ),
    name: 'whitelist',
    description: 'Manage user whitelist for sniping',
    usage: 'whitelist <add|remove|list> [user]',
    execute: async ({ client, interaction }) => {
        if (!interaction.inGuild()) return;

        // Check permissions - only allow users with MANAGE_GUILD or MANAGE_MESSAGES
        if (
            !interaction.memberPermissions?.has(Permissions.FLAGS.MANAGE_GUILD) &&
            !interaction.memberPermissions?.has(Permissions.FLAGS.MANAGE_MESSAGES)
        ) {
            const embed = client
                .newEmbed('RED')
                .setDescription('❌ You do not have permission to use this command.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        const subcommand = interaction.options.getSubcommand();
        const guildId = interaction.guildId;

        if (subcommand === 'add') {
            const user = interaction.options.getUser('user', true);
            const added = whitelist.add(guildId, user.id);
            const embed = client.newEmbed(added ? 'GREEN' : 'YELLOW');

            if (added) {
                embed.setDescription(`✅ Added ${user.toString()} to the whitelist.`);
            } else {
                embed.setDescription(`⚠️ ${user.toString()} is already whitelisted.`);
            }
            await interaction.reply({ embeds: [embed] });
        } else if (subcommand === 'remove') {
            const user = interaction.options.getUser('user', true);
            const removed = whitelist.remove(guildId, user.id);
            const embed = client.newEmbed(removed ? 'GREEN' : 'YELLOW');

            if (removed) {
                embed.setDescription(`✅ Removed ${user.toString()} from the whitelist.`);
            } else {
                embed.setDescription(`⚠️ ${user.toString()} is not in the whitelist.`);
            }
            await interaction.reply({ embeds: [embed] });
        } else if (subcommand === 'list') {
            const list = whitelist.getList(guildId);
            const embed = client.newEmbed();

            embed.setTitle('Whitelisted Users');
            if (list.length === 0) {
                embed.setDescription('No users are currently whitelisted.');
            } else {
                // Fetch user tags or mentions, or just list IDs if fetching is too heavy
                // For simplicity/display, we'll list mentions. 
                // Note: If list is huge, this might hit message limits. 
                // Given the context of a simple bot, we'll assume reasonable list size or truncate.
                const mentions = list.map(id => `<@${id}>`).join(', ');
                embed.setDescription(mentions.length > 4000 ? mentions.slice(0, 4000) + '...' : mentions);
                embed.setFooter({ text: `Total: ${list.length}` });
            }
            await interaction.reply({ embeds: [embed] });
        }
    },
};

export default command;
