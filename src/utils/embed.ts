import { MessageEmbed, ColorResolvable } from 'discord.js';
import { ExtendedClient } from '..';

export type ClientEmbed = (color?: ColorResolvable) => MessageEmbed;

const github = new URL('https://github.com/mist8kengas/ghost-ping-bot');
export default function newEmbed(
    client: ExtendedClient,
    color: ColorResolvable = '#832161'
) {
    // generate an embed to save on boiler-plate code
    const embed = new MessageEmbed();
    embed.setAuthor({
        name: 'ghost-ping-bot',
        url: github.href,
        iconURL: github.href + '/raw/master/assets/logo.png',
    });
    embed.setTitle('Ghost ping');
    embed.setColor(color);
    embed.setFooter({
        text: `v${client.version}`,
    });
    return embed;
}
