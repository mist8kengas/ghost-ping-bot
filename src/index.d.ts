import {
    Client,
    ColorResolvable,
    CommandInteraction,
    Message,
    MessageEmbed,
    PartialMessage,
    PermissionString,
} from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { Externals } from './handlers/interactionCreate';
import { ClientEmbed } from './utils/embed.js';

declare interface ExtendedClient extends Client {
    /**
     *
     * @description Semantic version number
     */
    version: `${number}.${number}.${number}`;
    commands: Collection<string, any>;
    newEmbed: ClientEmbed;
    deletedMessages: Map<string, [Message | PartialMessage, boolean]>;
}

declare interface Command {
    data: SlashCommandBuilder;
    name: string;
    description: string;
    usage: string;
    execute: (data: CommandPayload) => Promise<any>;
}

declare interface PayloadObject {
    prefix: string;
    args: string[];
    content: string;
    command: string;
}

declare interface CommandPayload {
    client: ExtendedClient;
    interaction: CommandInteraction;
    externals: Externals;
}
