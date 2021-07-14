import { RoleRepository } from "../Dal/RoleRepository";
import { RoleModel } from "../Models/RoleModel";

export class RoleService {

	private _roleRepository: RoleRepository;

	constructor() {
		this._roleRepository = new RoleRepository();
	}

	public async getStartRole(): Promise<RoleModel> {
		const result: unknown = await this._roleRepository.getStartRole();
		const roles: RoleModel[] = this.mapRoleModel(result);
		return roles[0];
	}

	public async getTicketRoles(): Promise<RoleModel[]> {
		const results: unknown = await this._roleRepository.getTicketRoles();
		const roles: RoleModel[] = this.mapRoleModel(results);
		return roles;
	}

	public mapRoleModel(data: any): RoleModel[] {
		const rolesArray: RoleModel[] = new Array<RoleModel>();

		data.forEach(e => {
			const model: RoleModel = new RoleModel();

			if (e.name) model.name = e.name;
			if (e.role_id) model.discordId = e.role_id;
			if (e.ticket === 0) model.isForTicket = false;
			if (e.ticket === 1) model.isForTicket = true;

			rolesArray.push(model);
		});

		return rolesArray;
	}
}