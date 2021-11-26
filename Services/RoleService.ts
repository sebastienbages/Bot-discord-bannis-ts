import { RoleRepository } from "../Dal/RoleRepository";
import { RoleModel } from "../Models/RoleModel";
import { AutoMapper } from "./AutoMapper";
import { GuildMember, SelectMenuInteraction } from "discord.js";
import { LogService } from "./LogService";
import { Config } from "../Config/Config";
import { ServerSelectMenu } from "../Interactions/SelectMenus/ServerSelectMenu";

export class RoleService {

	private _roleRepository: RoleRepository;
	private _serveurRoles: RoleModel[];
	private _logService: LogService;

	constructor() {
		this._roleRepository = new RoleRepository();
		this._logService = new LogService();
		(async () => {
			await this.updateServeurRoles();
		})();
	}

	/**
	 * Mise à jour des rôles correspondants aux différents serveurs
	 * @private
	 */
	private async updateServeurRoles(): Promise<void> {
		if (Config.nodeEnv === Config.nodeEnvValues.production) {
			this._serveurRoles = await this.getServeurRolesData();
		}
		else {
			this._serveurRoles = [];

			const serverOneRoleModel = new RoleModel();
			serverOneRoleModel.name = "serveur 1";
			serverOneRoleModel.discordId = Config.serverRoleOne;
			serverOneRoleModel.isForTicket = false;

			const serverTwoRoleModel = new RoleModel();
			serverTwoRoleModel.name = "serveur 2";
			serverTwoRoleModel.discordId = Config.serverRoleTwo;
			serverTwoRoleModel.isForTicket = false;

			this._serveurRoles.push(serverOneRoleModel);
			this._serveurRoles.push(serverTwoRoleModel);
		}
	}

	/**
	 * Assigne le role correspondant au numéro du serveur selon la réaction
	 * @param selectMenuInteraction
	 */
	public async assignServerRole(selectMenuInteraction: SelectMenuInteraction): Promise<void> {
		const guildMember = selectMenuInteraction.member as GuildMember;
		const guildMemberName = guildMember.displayName;

		for (const role of this._serveurRoles) {
			if (this.userHasRole(role.discordId, guildMember)) {
				return selectMenuInteraction.reply({ content: `Tu appartiens déjà au **${role.name}** :nerd:`, ephemeral: true, fetchReply: false });
			}
		}

		const choice = selectMenuInteraction.values[0] as string;

		if (choice === ServerSelectMenu.serverOne) {
			await guildMember.roles.add(Config.serverRoleOne);
			await guildMember.setNickname(guildMemberName + " (1)");
			await selectMenuInteraction.reply({ content: "Voilà, tu appartiens maintenant au **Serveur 1** :sunglasses: ! \n D'ailleurs je me suis permis de l'écrire à côté de ton pseudo :relaxed:", ephemeral: true, fetchReply: false });
			return this._logService.log(`${guildMember.displayName} a choisi le serveur 1`);
		}

		if (choice === ServerSelectMenu.serverTwo) {
			await guildMember.roles.add(Config.serverRoleTwo);
			await guildMember.setNickname(guildMemberName + " (2)");
			await selectMenuInteraction.reply({ content: "Voilà, tu appartiens maintenant au **Serveur 2** :sunglasses: ! \n D'ailleurs je me suis permis de l'écrire à côté de ton pseudo :relaxed:", ephemeral: true, fetchReply: false });
			return this._logService.log(`${guildMember.displayName} a choisi le serveur 2`);
		}
	}

	/**
	 * Retourne les rôles correspondants aux différents serveurs
	 * @private
	 */
	private async getServeurRolesData(): Promise<RoleModel[]> {
		const results: unknown = await this._roleRepository.getServerRoles();
		return AutoMapper.mapArrayRoleModel(results);
	}

	/**
	 * Vérifie la possession du rôle pour l'utilisateur
	 * @param user
	 * @param roleId
	 * @private
	 */
	public userHasRole(roleId: string, user: GuildMember): boolean {
		return user.roles.cache.has(roleId);
	}

	/**
	 * Attribue un rôle au membre de la guild
	 * @param guildMember
	 * @param roleId
	 */
	public async setRole(roleId: string, guildMember: GuildMember): Promise<GuildMember> {
		return await guildMember.roles.add(roleId);
	}

	/**
	 * Supprime un rôle pour le membre de la guild
	 * @param roleId
	 * @param guildMember
	 */
	public async removeRole(roleId: string, guildMember: GuildMember): Promise<GuildMember> {
		return await guildMember.roles.remove(roleId);
	}
}