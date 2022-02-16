import {
    Client,
    ColorResolvable,
    Message,
    MessageEmbed,
    PartialMessage,
    PermissionString,
} from 'discord.js';

declare interface ExtendedClient extends Client {
    commands: Collection<string, any>;
}

declare interface Command {
    name: string;
    description: string;
    permissions: PermissionString[];
    usage: string;
    alias: string[];
    execute: (data: CommandPayload) => Promise<any>;
}

declare interface PayloadObject {
    prefix: string;
    args: string[];
    content: string;
    command: string;
}

declare interface CommandPayload {
    msg: Message;
    payload: PayloadObject;
    client: ExtendedClient;
    newEmbed: (color?: ColorResolvable) => MessageEmbed;
    deletedMessages: Map<string, [Message, boolean]>;
    github: URL;
}
