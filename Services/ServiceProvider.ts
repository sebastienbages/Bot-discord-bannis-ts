import { TicketService } from "./TicketService";
import { TopServerService } from "./TopServerService";


export class ServiceProvider {

    private static _ticketService: TicketService;
    private static _topServerService: TopServerService;

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
}