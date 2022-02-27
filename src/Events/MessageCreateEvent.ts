import { Message } from "discord.js";
import { ServicesProvider } from "../ServicesProvider";
import { LogService } from "../Services/LogService";

export class MessageCreateEvent {
	private logService: LogService;

	constructor() {
		this.logService = ServicesProvider.getLogService();
	}

	async run(message: Message): Promise<void> {
		try {
			if (message.author.bot) return undefined;

			if (message.channel.type === "DM") {
				const adminService = await ServicesProvider.getAdminService();
				return await adminService.transfertPrivateMessage(message);
			}
		}
		catch (error) {
			await this.logService.handlerError(error, message.client);
		}
	}
}
