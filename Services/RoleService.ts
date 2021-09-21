import { RoleRepository } from "../Dal/RoleRepository";
import { RoleModel } from "../Models/RoleModel";
import { AutoMapper } from "./AutoMapper";

export class RoleService {

	private _roleRepository: RoleRepository;
	private _serveurRoles: RoleModel[];

	public static serveurOneReaction = "1️⃣";
	public static serveurTwoReaction = "2️⃣";

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

	/**
	 * Retourne les rôles correspondants aux différents serveurs stocké en cache
	 */
	public getServerRoles(): RoleModel[] {
		return this._serveurRoles;
	}

	/**
	 * Retourne les rôles correspondants aux différents serveurs
	 * @private
	 */
	private async getServeurRolesData(): Promise<RoleModel[]> {
		const results: unknown = await this._roleRepository.getServerRoles();
		return AutoMapper.mapArrayRoleModel(results);
	}
}