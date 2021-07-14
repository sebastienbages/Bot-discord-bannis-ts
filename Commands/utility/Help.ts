import { MessageEmbed } from "discord.js";
import { ICommand } from "../ICommand";
import { CommandContext } from "../CommandContext";
import { Config } from "../../Config/Config";

export class HelpCommand implements ICommand {

    public readonly name = "help";
    public readonly aliases = [ "commandes", "aide" ];
    public readonly argumentIsNecessary = false;
    public readonly description = "Liste de toutes les commandes ou détail d\'une commande spécifique";
    public readonly usage = "<nom de la commande>";
    public readonly guildOnly = false;
    public readonly cooldown = 0;
    public readonly permission = 'MANAGE_MESSAGES';

    async run(commandContext: CommandContext): Promise<void> {

        const args = commandContext.args;
        const message = commandContext.message;
        const commands = Config.getCommandsInstances();

        try {
            const data = [];

            if (!args.length) {
                data.push('Liste des commandes :');
                data.push(commands.map(command => `\`${command.name}\``).join(', '));
                data.push(`\nTu peux m'envoyer en privé \`${commandContext.commandPrefix}help [nom de la commande]\` pour obtenir plus d'informations sur une commande :wink:`);

                await message.author.send(data, { split: true })
                if (message.channel.type === 'dm') return undefined;
                const response = await message.reply('Je t\'ai envoyé la liste des commandes en message privé :wink:')
                response.delete({ timeout: 5000 });
                return undefined;
            }

            const name = args[0].toLowerCase();
            const command = commands.find(command => command.aliases.includes(name) || command.name.includes(name));

            if (!command) {
                if (message.channel.type === 'dm') {
                    message.reply('Cette commande n\'existe pas');
                }
                else {
                    const response = await message.reply('Cette commande n\'existe pas')
                    response.delete({ timeout: 10000 });
                    return undefined;
                }
            }

            data.push(`**Nom:** \`${command.name}\``);

            if (command.aliases && command.aliases.length > 0) {
                data.push(`**Alias :** \`${command.aliases.join(', ')}\``);
            }
            else {
                data.push("**Alias :** `aucun`");
            }

            if (command.description) data.push(`**Description :** ${command.description}`);
            if (command.usage) data.push(`**Usage :** \`${commandContext.commandPrefix}${command.name} ${command.usage}\``);

            data.push(`**Cooldown :** ${command.cooldown} seconde(s)`);

            message.author.send(data, { split: true });
        } 
        catch (error) {
            throw error;
        }
    }
}