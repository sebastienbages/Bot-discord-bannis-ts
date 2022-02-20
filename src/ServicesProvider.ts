import { AdminService } from "./Services/AdminService";
import { RoleService } from "./Services/RoleService";
import { TicketService } from "./Services/TicketService";
import { TopServerService } from "./Services/TopServerService";
import { VoteService } from "./Services/VoteService";
import { RuleService } from "./Services/RuleService";
import { SlashCommandService } from "./Services/SlashCommandService";
import { ButtonService } from "./Services/ButtonService";
import { SelectMenuService } from "./Services/SelectMenuService";
import { LogService } from "./Services/LogService";
import { GameServersService } from "./Services/GameServersService";

export class ServicesProvider {
	private static ticketService: TicketService;
	private static topServerService: TopServerService;
	private static voteService: VoteService;
	private static adminService: AdminService;
	private static roleService: RoleService;
	private static ruleService: RuleService;
	private static slashCommandService: SlashCommandService;
	private static buttonService: ButtonService;
	private static selectMenuService: SelectMenuService;
	private static logService: LogService;
	private static gameServersService: GameServersService;

	public static initializeServices(): void {
		this.logService = new LogService();
		this.ticketService = new TicketService();
		this.topServerService = new TopServerService();
		this.voteService = new VoteService();
		this.adminService = new AdminService();
		this.roleService = new RoleService();
		this.ruleService = new RuleService();
		this.buttonService = new ButtonService();
		this.selectMenuService = new SelectMenuService();
		this.gameServersService = new GameServersService();
		this.slashCommandService = new SlashCommandService();
	}

	public static getTicketService(): TicketService {
		return this.ticketService;
	}

	public static getTopServerService(): TopServerService {
		return this.topServerService;
	}

	public static getVoteService(): VoteService {
		return this.voteService;
	}

	public static getAdminService(): AdminService {
		return this.adminService;
	}

	public static getRoleService(): RoleService {
		return this.roleService;
	}

	public static getRuleService(): RuleService {
		return this.ruleService;
	}

	public static getSlashCommandService(): SlashCommandService {
		return this.slashCommandService;
	}

	public static getButtonService(): ButtonService {
		return this.buttonService;
	}

	public static getSelectMenuService(): SelectMenuService {
		return this.selectMenuService;
	}

	public static getLogService(): LogService {
		return this.logService;
	}

	public static getGameServersService(): GameServersService {
		return this.gameServersService;
	}
}
