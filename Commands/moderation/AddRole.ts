import { MessageEmbed } from "discord.js";
import { ICommand } from "../ICommand";
import { CommandContext } from "../CommandContext";
import { Config } from "../../Config/Config";

export class AddRoleCommand implements ICommand {

    public readonly name = "addrole";
    public readonly aliases = [ "ajouter_role" ];
    public readonly argumentIsNecessary = true;
    public readonly description = "Ajoute un rôle pour un membre";
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
                const response = await message.reply('ce membre n\'existe pas')
                response.delete({ timeout: 5000 });
                return undefined;
            }

            const roleAssign = args[1];
            const role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleAssign.toLowerCase());

            if (!role) {
                const response = await message.reply('ce rôle n\'existe pas !')
                response.delete({ timeout: 5000 });
                return undefined;
            }

            if (user.roles.cache.has(role.id)) {
                const response = await message.reply('ce membre possède déjà ce role !')
                response.delete({ timeout: 5000 });
                return undefined;
            }

            user.roles.add(role.id)

            const dmMessageToUser = new MessageEmbed()
                .setColor(Config.color)
                .setDescription(`Bravo ! Tu as reçu le rôle de **${role.name}** !`);

            user.send(dmMessageToUser)

            const response = await message.reply('rôle attribué avec succès !');
            response.delete({ timeout: 5000 });
        }
        catch (error) {
            throw error;
        }
    }
}