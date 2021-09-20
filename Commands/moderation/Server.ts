import { ICommand } from "../ICommand";
import { Guild, PermissionResolvable, RoleManager, TextChannel } from "discord.js";
import { CommandContext } from "../CommandContext";
import { RoleService } from "../../Services/RoleService";
import { ServiceProvider } from "../../src/ServiceProvider";
import { RoleModel } from "../../Models/RoleModel";
import { Config } from "../../Config/Config";

export class ServerCommand implements ICommand {
	public readonly name: string = "server";
	public readonly aliases: string[] = [ "serveur" ];
	public readonly argumentIsNecessary: boolean = false;
	public readonly description: string = "Message pour la répartition des membres sur les deux serveurs";
	public readonly usage: string = "Juste le nom de la commande :)";
	public readonly guildOnly: boolean = true;
	public readonly cooldown: number = 0;
	public readonly permission: PermissionResolvable = "MANAGE_MESSAGES";

	async run(commandContext: CommandContext): Promise<void> {
		const roleService: RoleService = ServiceProvider.getRoleService();
		const roleModels: RoleModel[] = await roleService.getServerRoles();
		const guild: Guild = commandContext.message.guild;
		const roleManager: RoleManager = commandContext.message.guild.roles;

		const serverOneRoleModel = roleModels.find(r => r.name == "serveur_1");
		const serverTwoRoleModel = roleModels.find(r => r.name == "serveur_2");

		const serverOneRole = await roleManager.fetch(serverOneRoleModel.discordId);
		const serverTwoRole = await roleManager.fetch(serverTwoRoleModel.discordId);

		if (!serverOneRole || !serverTwoRole) {
			throw new Error("Il manque un ou plusieurs rôles correspondants aux différents serveurs");
		}

		const rulesChannel = guild.channels.cache.find(c => c.id === Config.rulesChannelId) as TextChannel;

		if (!rulesChannel) {
			throw new Error("Le channel du règlement est introuvable");
		}

		const serverMessage = await rulesChannel.send(
			`LES SERVEURS

			Deux serveurs sont disponibles avec les mêmes mods et le même contenu. 
			Vous ne pouvez rejoindre que un seul serveur, les bases en doublons seront supprimées et une sanction sera appliquée !
			Merci de cliquer sur ${RoleService.serveurOneReaction} ou ${RoleService.serveurTwoReaction} pour valider le choix de votre serveur !`
		);

		await serverMessage.react(RoleService.serveurOneReaction);
		await serverMessage.react(RoleService.serveurTwoReaction);
	}
}