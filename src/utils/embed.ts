import { MessageEmbed, ColorResolvable } from 'discord.js';

const github = new URL('https://github.com/mist8kengas/ghost-ping-bot');
export default function newEmbed(color: ColorResolvable = '#832161') {
    // generate an embed to save on boiler-plate code
    const embed = new MessageEmbed();
    embed.setAuthor({
        name: 'ghost-ping-bot',
        url: github.href,
        iconURL: github.href + '/raw/master/assets/logo.png',
    });
    embed.setTitle('Ghost ping');
    embed.setColor(color);
    return embed;
}
