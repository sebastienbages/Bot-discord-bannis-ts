import { RoleRepository } from "../Dal/RoleRepository";
import { RoleModel } from "../Models/RoleModel";
import { AutoMapper } from "./AutoMapper";
import { GuildMember, MessageReaction } from "discord.js";
import { RuleService } from "./RuleService";
import { LogService } from "./LogService";

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
	 * Assigne le role correspondant au numéro du serveur selon la réaction
	 * @param messageReaction
	 * @param user
	 */
	public async assignServerRole(messageReaction: MessageReaction, user: GuildMember): Promise<void> {
		const indexReaction: number = RuleService.serveurReactions.indexOf(messageReaction.emoji.name);
		const roleId: string = this._serveurRoles[indexReaction].discordId;

		for (const r of this._serveurRoles) {
			const index = this._serveurRoles.indexOf(r);
			if (this.userHasRole(user, r.discordId)) {
				await messageReaction.users.remove(user);
				await user.send(`Désolé, tu appartiens déjà au serveur ${RuleService.serveurReactions[index]} !`);
				return undefined;
			}
		}

		await user.roles.add(roleId);
		await user.send(`Tu appartiens désormais au serveur ${messageReaction.emoji.name}, amuses toi bien :wink:`);
		this._logService.log(`${user.displayName} a choisi le serveur ${(indexReaction + 1).toString()}`);
	}

	/**
	 * Retourne les rôles correspondants aux différents serveurs
	 * @private
	 */
	private async getServeurRolesData(): Promise<RoleModel[]> {
		const results: unknown = await this._roleRepository.getServerRoles();
		return AutoMapper.mapArrayRoleModel(results);
	}

	private userHasRole(user: GuildMember, roleId: string): boolean {
		return user.roles.cache.has(roleId);
	}
}