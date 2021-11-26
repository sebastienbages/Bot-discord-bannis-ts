import { Message } from "discord.js";
import { ServicesProvider } from "../src/ServicesProvider";
import { LogService } from "../Services/LogService";

export class MessageCreateEvent {
	private _logService: LogService;

	constructor() {
		this._logService = new LogService();
	}

	async run(message: Message): Promise<void> {
		if (message.author.bot) return undefined;

		if (message.channel.type === "DM") {
			const adminService = await ServicesProvider.getAdminService();
			return await adminService.transfertPrivateMessage(message);
		}
	}
}