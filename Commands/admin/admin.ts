import { ICommand } from "../ICommand";
import { CommandContext } from "../CommandContext";
import { ServiceProvider } from "../../src/ServiceProvider";
import { GuildMember, Message, PermissionResolvable } from "discord.js";
import { AdminService } from "../../Services/AdminService";

export class AdminCommand implements ICommand {
	public readonly name: string = "admin";
	public readonly aliases: string[] = [];
	public readonly argumentIsNecessary: boolean = true;
	public readonly description: string = "Outils de gestion des admins du serveur";
	public readonly usage: string = "[list] / [add] <@membre> / [remove] <@membre>";
	public readonly guildOnly: boolean = true;
	public readonly cooldown: number = 0;
	public readonly permission: PermissionResolvable = "ADMINISTRATOR";

	async run(commandContext: CommandContext): Promise<void> {
		const command: string = commandContext.args[0].toLowerCase();
		const adminService: AdminService = ServiceProvider.getAdminService();
		const message: Message = commandContext.message;
		const args: string[] = commandContext.args;

		if (command === "list") {
			const adminsNames: string[] = await adminService.getAdminsNames();
			const data: string[] = new Array<string>();
			data.push("__LISTE DES ADMINISTRATEURS :__");
			data.push(`\`${adminsNames.join(", ")}\``);
			message.channel.send(data);
			return undefined;
		}

		const user: GuildMember = message.guild.member(message.mentions.users.first()) || message.guild.members.cache.get(args[1]);

		if (!user) {
			const response: Message = await message.reply("ce membre n'existe pas");
			response.delete({ timeout: 5000 });
			return undefined;
		}

		const discordId: string = user.user.id;
		const userName: string = user.user.username;

		if (command === "add") {

			if (await adminService.adminIsExist(discordId)) {
				const response: Message = await message.reply("ce membre est déjà enregistré");
				response.delete({ timeout: 5000 });
				return undefined;
			}
			else {
				await adminService.createAdmin(discordId, userName);
				const response: Message = await message.reply("enregistrement effectué avec succès");
				response.delete({ timeout: 5000 });
			}
		}
		else if (command === "remove") {

			if (!await adminService.adminIsExist(discordId)) {
				const response: Message = await message.reply("ce membre n'est pas enregistré");
				response.delete({ timeout: 5000 });
				return undefined;
			}
			else {
				await adminService.removeAdmin(discordId);
				const response: Message = await message.reply("administrateur supprimé avec succès");
				response.delete({ timeout: 5000 });
			}
		}
	}
}