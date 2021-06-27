import { ICommand } from "../ICommand";
import { CommandContext } from "../CommandContext";

export class SayPrivCommand implements ICommand {

    public readonly name = "saypriv";
    public readonly aliases = [ "prive", "chuchoter" ];
    public readonly argumentIsNecessary = true;
    public readonly description = "Envoi un message privé à l\'utilisateur spécifié";
    public readonly usage = "<@membre> <message>";
    public readonly guildOnly = true;
    public readonly cooldown = 0;
    public readonly permission = 'MANAGE_MESSAGES';

    async run(commandContext: CommandContext): Promise<void> {

        const message = commandContext.message;
        const args = commandContext.args;

        try {
            const user = message.guild.member(message.mentions.users.first()) || message.guild.members.cache.get(args[0]);

            if (!user) {
                const response = await message.reply('ce membre n\'existe pas')
                response.delete({ timeout: 5000 });
                return undefined;
            }

            const privateMessage = args[1];

            if (!privateMessage || privateMessage.length < 1) {
                const response = await message.reply('ton message est vide')
                response.delete({ timeout: 5000 });
                return undefined;
            }

            user.send(privateMessage);
        } 
        catch (error) {
            message.reply('je n\'arrive pas à lui envoyer un message privé !');
            throw error;
        }
    }
}