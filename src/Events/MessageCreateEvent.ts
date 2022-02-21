import { Message } from "discord.js";
import { ServicesProvider } from "../ServicesProvider";
import { LogService } from "../Services/LogService";

export class MessageCreateEvent {
	private _logService: LogService;

	constructor() {
		this._logService = ServicesProvider.getLogService();
	}

	async run(message: Message): Promise<void> {
		if (message.author.bot) return undefined;

		if (message.channel.type === "DM") {
			const adminService = await ServicesProvider.getAdminService();
			return await adminService.transfertPrivateMessage(message);
		}
	}
}
