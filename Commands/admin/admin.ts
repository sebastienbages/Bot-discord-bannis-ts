import { ICommand } from "../ICommand";
import { CommandContext } from "../CommandContext";
import { ServiceProvider } from "../../src/ServiceProvider";

export class AdminCommand implements ICommand {

    public readonly name = "admin";
    public readonly aliases = [];
    public readonly argumentIsNecessary = true;
    public readonly description = "Outils de gestion des admins du serveur";
    public readonly usage = "[list] / [add] <@membre> / [remove] <@membre>";
    public readonly guildOnly = true;
    public readonly cooldown = 0;
    public readonly permission = "ADMINISTRATOR";

    async run(commandContext: CommandContext): Promise<void> {

        const command = commandContext.args[0].toLowerCase();
        const adminService = ServiceProvider.getAdminService();
        const message = commandContext.message;
        const args = commandContext.args;

		if (command === 'list') {

			const adminsNames = await adminService.getAdminsNames();
			const data = [];

			data.push('__LISTE DES ADMINISTRATEURS :__');
			data.push(`\`${adminsNames.join(', ')}\``);

		    message.channel.send(data);
            return undefined;
		}

		const user = message.guild.member(message.mentions.users.first()) || message.guild.members.cache.get(args[1]);

		if (!user) {
			const response = await message.reply('ce membre n\'existe pas');
            response.delete({ timeout: 5000 });
            return undefined;
		}

		const discordId = user.user.id;
		const userName = user.user.username;

		if (command === 'add') {

			if (await adminService.adminIsExist(discordId)) {
				const response = await message.reply('ce membre est déjà enregistré');
                response.delete({ timeout: 5000 });
                return undefined;
			}
			else {
				await adminService.createAdmin(discordId, userName);

				const response = await message.reply('enregistrement effectué avec succès');
                response.delete({ timeout: 5000 });
			}
		}
		else if (command === 'remove') {

			if (!await adminService.adminIsExist(discordId)) {
				const response = await message.reply('ce membre n\'est pas enregistré')
                response.delete({ timeout: 5000 });
                return undefined;
			}
			else {

				await adminService.removeAdmin(discordId);

				const response = await message.reply('administrateur supprimé avec succès')
                response.delete({ timeout: 5000 });
			}
		}
    }
}