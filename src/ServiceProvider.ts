import { AdminService } from "../Services/AdminService";
import { RoleService } from "../Services/RoleService";
import { TicketService } from "../Services/TicketService";
import { TopServerService } from "../Services/TopServerService";
import { VoteService } from "../Services/VoteService";

export class ServiceProvider {
	private static _ticketService: TicketService;
	private static _topServerService: TopServerService;
	private static _voteService: VoteService;
	private static _adminService: AdminService;
	private static _roleService: RoleService;

	public static async getTicketService(): Promise<TicketService> {
		if (!this._ticketService) {
			this._ticketService = new TicketService();
			await this._ticketService.updateTicketConfig();
			await this._ticketService.updateTicketRoles();
		}
		return this._ticketService;
	}

	public static getTopServerService(): TopServerService {
		if (!this._topServerService) this._topServerService = new TopServerService();
		return this._topServerService;
	}

	public static getVoteService(): VoteService {
		if (!this._voteService) this._voteService = new VoteService();
		return this._voteService;
	}

	public static async getAdminService(): Promise<AdminService> {
		if (!this._adminService) {
			this._adminService = new AdminService();
			await this._adminService.updateAdmins();
		}
		return this._adminService;
	}

	public static getRoleService(): RoleService {
		if (!this._roleService) this._roleService = new RoleService();
		return this._roleService;
	}
}