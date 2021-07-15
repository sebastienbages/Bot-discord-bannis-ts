import { RoleRepository } from "../Dal/RoleRepository";
import { RoleModel } from "../Models/RoleModel";
import { AutoMapper } from "./AutoMapper";

export class RoleService {

	private _roleRepository: RoleRepository;

	constructor() {
		this._roleRepository = new RoleRepository();
	}

	public async getStartRole(): Promise<RoleModel> {
		const result: unknown = await this._roleRepository.getStartRole();
		return AutoMapper.mapRoleModel(result);
	}

	public async getTicketRoles(): Promise<RoleModel[]> {
		const results: unknown = await this._roleRepository.getTicketRoles();
		return AutoMapper.mapArrayRoleModel(results);
	}
}