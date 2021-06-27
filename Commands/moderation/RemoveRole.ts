import { ICommand } from "../ICommand";
import { CommandContext } from "../CommandContext";

export class RemoveRoleCommand implements ICommand {

    public readonly name = "removerole";
    public readonly aliases = [ "supprimer_role" ];
    public readonly argumentIsNecessary = true;
    public readonly description = "Supprime un rôle pour un membre";
    public readonly usage = "<@membre> <role>";
    public readonly guildOnly = true;
    public readonly cooldown = 0;
    public readonly permission = 'MANAGE_ROLES';

    async run(commandContext: CommandContext): Promise<void> {

        const message = commandContext.message;
        const args = commandContext.args;

        try {
            const user = message.guild.member(message.mentions.users.first()) || message.guild.members.cache.get(args[0]);

            if (!user) {
                const response = await message.reply('le membre n\'existe pas');
                response.delete({ timeout: 5000 });
                return undefined;
            }

            const roleAssign = args[1];
            const role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleAssign.toLowerCase());

            if (!role) {
                const response = await message.reply('ce rôle n\'existe pas !');
                response.delete({ timeout: 5000 });
                return undefined;
            }

            if (user.roles.cache.has(role.id)) {

                user.roles.remove(role.id)
                    .catch(console.error);

                const response = await message.reply('rôle supprimé avec succès !');
                response.delete({ timeout: 5000 });
            }
            else {
                const response = await message.reply('cet utilisateur ne possède pas ce rôle');
                response.delete({ timeout: 5000 });
            }
        } 
        catch (error) {
            throw error;
        }
    }
}