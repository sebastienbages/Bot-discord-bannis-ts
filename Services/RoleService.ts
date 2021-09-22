import { RoleRepository } from "../Dal/RoleRepository";
import { RoleModel } from "../Models/RoleModel";
import { AutoMapper } from "./AutoMapper";
import { GuildMember, MessageReaction } from "discord.js";
import { RuleService } from "./RuleService";

export class RoleService {

	private _roleRepository: RoleRepository;
	private _serveurRoles: RoleModel[];

	constructor() {
		this._roleRepository = new RoleRepository();
		(async () => {
			await this.updateServeurRoles();
		})();
	}

	/**
	 * Mise à jour des rôles correspondants aux différents serveurs
	 * @private
	 */
	private async updateServeurRoles(): Promise<void> {
		this._serveurRoles = await this.getServeurRolesData();
	}

	/**
	 * Retourne le Role attribué aux nouveaux arrivants sur le serveur
	 */
	public async getStartRole(): Promise<RoleModel> {
		const result: unknown = await this._roleRepository.getStartRole();
		return AutoMapper.mapRoleModel(result);
	}

	/**
	 * Retourne les Roles autorisés pour l'administration des tickets
	 */
	public async getTicketRoles(): Promise<RoleModel[]> {
		const results: unknown = await this._roleRepository.getTicketRoles();
		return AutoMapper.mapArrayRoleModel(results);
	}

	public async assignServerRole(messageReaction: MessageReaction, user: GuildMember): Promise<void> {
		const indexReaction: number = RuleService.serveurReactions.indexOf(messageReaction.emoji.name);
		const roleId: string = this._serveurRoles[indexReaction].discordId;
		if (!this.userHasRole(user, roleId)) {
			await user.roles.add(roleId);
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

	public userHasRole(user: GuildMember, roleId: string): boolean {
		if (!user.roles.cache.has(roleId)) {
			return true;
		}

		return false;
	}
}