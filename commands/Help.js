module.exports = {
    name: 'help',
    description: 'Display commands and their uses',
    permissions: ['SEND_MESSAGES'],
    usage: 'help',
    alias: ['h', 'cmds', 'commands', 'cmdlist'],
    execute: async (data) => {
        const { msg } = data,
            embed = newEmbed().setTimestamp().setTitle('Commands list');

        client.commands.map((cmd, cmdName) =>
            embed.addField(
                cmdName,
                `> **Description:** ${cmd.description}\n` +
                    `> **Usage:** ${cmd.usage}\n` +
                    `> **Aliases:** ${cmd.alias.join(', ')}`,
                false
            )
        );

        msg.reply({ embeds: [embed] }).catch((reason) => {
            console.error('[error]', reason);
        });
    },
};
