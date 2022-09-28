import { Command, ExtendedClient } from '..';
import { CommandInteraction, Message, PartialMessage } from 'discord.js';
import newEmbed from '../utils/embed.js';

export interface Externals {
    deletedMessages: Map<string, [Message | PartialMessage, boolean]>;
    github: URL;
}

export default async function interactionCreate(
    client: ExtendedClient,
    interaction: CommandInteraction,
    externals: Externals
) {
    // return if interaction is not a command
    if (!interaction.isCommand()) return;

    // get command
    const command: Command | undefined = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute({ client, interaction, externals });
    } catch (error) {
        console.error('[interaction:error]', error);
        await interaction
            .reply({
                embeds: [
                    newEmbed().setDescription(
                        ':warning: An error occured while trying to run this command.'
                    ),
                ],
                ephemeral: true,
            })
            .catch((error) => console.error('[interaction:error:fatal]', error));
    }
}
