import { AdminService } from "../Services/AdminService";
import { RoleService } from "../Services/RoleService";
import { TicketService } from "../Services/TicketService";
import { TopServerService } from "../Services/TopServerService";
import { VoteService } from "../Services/VoteService";
import { RuleService } from "../Services/RuleService";
import { SlashCommandService } from "../Services/SlashCommandService";

export class ServicesProvider {
	private static _ticketService: TicketService;
	private static _topServerService: TopServerService;
	private static _voteService: VoteService;
	private static _adminService: AdminService;
	private static _roleService: RoleService;
	private static _ruleService: RuleService;
	private static _slashCommandService: SlashCommandService;

	public static initializeServices(): void {
		this._ticketService = new TicketService();
		this._topServerService = new TopServerService();
		this._voteService = new VoteService();
		this._adminService = new AdminService();
		this._roleService = new RoleService();
		this._ruleService = new RuleService();
		this._slashCommandService = new SlashCommandService();
	}

	public static getTicketService(): TicketService {
		return this._ticketService;
	}

	public static getTopServerService(): TopServerService {
		return this._topServerService;
	}

	public static getVoteService(): VoteService {
		return this._voteService;
	}

	public static getAdminService(): AdminService {
		return this._adminService;
	}

	public static getRoleService(): RoleService {
		return this._roleService;
	}

	public static getRuleService(): RuleService {
		return this._ruleService;
	}

	public static getSlashCommandService(): SlashCommandService {
		return this._slashCommandService;
	}
}