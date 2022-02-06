import { RoleRepository } from "../Dal/RoleRepository";
import { RoleModel } from "../Models/RoleModel";
import { AutoMapper } from "./AutoMapper";
import { GuildMember, MessageAttachment, SelectMenuInteraction } from "discord.js";
import { LogService } from "./LogService";
import { Config } from "../Config/Config";
import util from "util";

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
	 * Assigne le role du serveur 2 au membre
	 * @param guildMember
	 */
	public async assignServerTwoRole(guildMember: GuildMember): Promise<void> {
		await guildMember.roles.add(Config.serverRoleTwo);
		await guildMember.setNickname(guildMember.displayName + " (2)");
		this._logService.log(`${guildMember.displayName} a choisi le serveur 2`);
	}

	/**
	 * Assigne le role du serveur 1 au membre
	 * @param guildMember
	 */
	public async assignServerOneRole(guildMember: GuildMember): Promise<void> {
		await guildMember.roles.add(Config.serverRoleOne);
		await guildMember.setNickname(guildMember.displayName + " (1)");
		this._logService.log(`${guildMember.displayName} a choisi le serveur 1`);
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

	/**
	 * Assigne le rôle de départ pour accéder à la totalité du discord
	 * @param selectMenuInteraction
	 */
	public async assignStartRole(selectMenuInteraction: SelectMenuInteraction): Promise<void> {
		const guildMember = selectMenuInteraction.member as GuildMember;
		if (!this.userHasRole(Config.roleStart, guildMember)) {
			const wait = util.promisify(setTimeout);
			const teleportationImage = new MessageAttachment(Config.imageDir + "/teleportation.gif");
			await selectMenuInteraction.followUp({ content: "Ok c'est parti ! Accroche ta ceinture ça va secouer :rocket:", files: [ teleportationImage ], ephemeral: true, fetchReply: true });
			await wait(8000);
			await this.setRole(Config.roleStart, guildMember);
			await this.removeRole(Config.roleFrontiere, guildMember);
		}
	}

	/**
	 * Retourne la liste des rôles des serveurs de jeux
	 */
	public getServerRoles(): RoleModel[] {
		return this._serveurRoles;
	}
}
