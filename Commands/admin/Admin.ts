import { ICommand } from "../ICommand";
import { CommandContext } from "../CommandContext";
import { ServiceProvider } from "../../src/ServiceProvider";
import { GuildMember, Message, PermissionResolvable } from "discord.js";
import { AdminService } from "../../Services/AdminService";
import { DiscordHelper } from "../../Helper/DiscordHelper";

export class AdminCommand implements ICommand {
	public readonly name: string = "admin";
	public readonly aliases: string[] = [];
	public readonly argumentIsNecessary: boolean = true;
	public readonly description: string = "Outils de gestion des admins du serveur";
	public readonly usage: string = "[list] / [add] <@membre> / [remove] <@membre>";
	public readonly guildOnly: boolean = true;
	public readonly cooldown: number = 0;
	public readonly permission: PermissionResolvable = "ADMINISTRATOR";

	private _adminService: AdminService;

	constructor() {
		this._adminService = ServiceProvider.getAdminService();
	}

	async run(commandContext: CommandContext): Promise<void> {
		const command: string = commandContext.args[0].toLowerCase();
		const message: Message = commandContext.message;

		if (command === "list") {
			return this._adminService.sendAdminList(message);
		}

		const user: GuildMember = await DiscordHelper.getUserByMention(message);
		const discordId: string = user.id;

		if (!user) {
			const response: Message = await DiscordHelper.replyToMessageAuthor(message, "Ce membre n'existe pas");
			return DiscordHelper.deleteMessage(response, 5000);
		}

		if (command === "add") {
			if (!this._adminService.adminIsExist(discordId)) {
				await this._adminService.createAdmin(discordId, user.displayName);
				const response: Message = await DiscordHelper.replyToMessageAuthor(message, "Enregistrement effectué avec succès");
				return DiscordHelper.deleteMessage(response, 5000);
			}
			else {
				const response: Message = await DiscordHelper.replyToMessageAuthor(message, "Ce membre est déjà enregistré");
				return DiscordHelper.deleteMessage(response, 5000);
			}
		}

		if (command === "remove") {
			if (this._adminService.adminIsExist(discordId)) {
				await this._adminService.removeAdmin(discordId);
				const response: Message = await DiscordHelper.replyToMessageAuthor(message, "Administrateur supprimé avec succès");
				return DiscordHelper.deleteMessage(response, 5000);
			}
			else {
				const response: Message = await DiscordHelper.replyToMessageAuthor(message, "Ce membre n'est pas enregistré");
				return DiscordHelper.deleteMessage(response, 5000);
			}
		}
	}
}