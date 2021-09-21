import { RoleService } from "./RoleService";
import { ServiceProvider } from "../src/ServiceProvider";
import { RoleModel } from "../Models/RoleModel";
import { Collection, Guild, Message, RoleManager, TextChannel } from "discord.js";
import { Config } from "../Config/Config";

export class RuleService {

	private _roleService: RoleService;

	constructor() {
		this._roleService = new RoleService();
	}

	public async addReactForServeurChoice(roleManager: RoleManager, guild: Guild, message: Message): Promise<void> {
		const roleService: RoleService = ServiceProvider.getRoleService();
		const roleModels: RoleModel[] = roleService.getServerRoles();

		const serverOneRoleModel = roleModels.find(r => r.name == "serveur_1");
		const serverTwoRoleModel = roleModels.find(r => r.name == "serveur_2");

		const serverOneRole = await roleManager.fetch(serverOneRoleModel.discordId);
		const serverTwoRole = await roleManager.fetch(serverTwoRoleModel.discordId);

		if (!serverOneRole || !serverTwoRole) {
			throw new Error("Il manque un ou plusieurs rôles correspondants aux différents serveurs");
		}

		const rulesChannel = await message.client.channels.fetch(Config.rulesChannelId) as TextChannel;

		if (!rulesChannel) {
			throw new Error("Le channel du règlement est introuvable");
		}

		const channelMessages: Collection<string, Message> = await rulesChannel.messages.fetch();
		const lastMessage: Message = channelMessages.last();

		if (lastMessage) {
			await lastMessage.react(RoleService.serveurOneReaction);
			await lastMessage.react(RoleService.serveurTwoReaction);
		}
		else {
			throw new Error("Il n'y a pas de messages dans le channel");
		}
	}
}