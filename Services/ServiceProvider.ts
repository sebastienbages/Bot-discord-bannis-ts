import { AdminService } from "./AdminService";
import { RoleService } from "./RoleService";
import { TicketService } from "./TicketService";
import { TopServerService } from "./TopServerService";
import { VoteService } from "./VoteService";


export class ServiceProvider {

    private static _ticketService: TicketService;
    private static _topServerService: TopServerService;
    private static _voteService: VoteService;
    private static _adminService: AdminService;
    private static _roleService: RoleService;

    constructor() { }

    public static getTicketService(): TicketService {
        if (!ServiceProvider._ticketService) {
            this._ticketService = new TicketService();
        }
        return this._ticketService;
    }

    public static getTopServerService(): TopServerService {
        if (!ServiceProvider._topServerService) {
            this._topServerService = new TopServerService();
        }
        return this._topServerService;
    }

    public static getVoteService(): VoteService {
        if (!ServiceProvider._voteService) {
            this._voteService = new VoteService();
        }
        return this._voteService;
    }

    public static getAdminService(): AdminService {
        if (!ServiceProvider._adminService) {
            this._adminService = new AdminService();
        }
        return this._adminService;
    }

    public static getRoleService(): RoleService {
        if (!ServiceProvider._roleService) {
            this._roleService = new RoleService();
        }
        return this._roleService;
    }
}