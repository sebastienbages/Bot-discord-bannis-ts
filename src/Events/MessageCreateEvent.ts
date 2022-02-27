import { Message, TextChannel } from "discord.js";
import { ServicesProvider } from "../ServicesProvider";
import { LogService } from "../Services/LogService";
import { AdminService } from "../Services/AdminService";
import { RuleService } from "../Services/RuleService";

export class MessageCreateEvent {
	private logService: LogService;
	private adminService: AdminService;
	private ruleService: RuleService;

	constructor() {
		this.logService = ServicesProvider.getLogService();
		this.adminService = ServicesProvider.getAdminService();
		this.ruleService = ServicesProvider.getRuleService();
	}

	async run(message: Message): Promise<void> {
		try {
			if (message.author.bot) return undefined;

			if (message.channel.type === "DM") {
				return await this.adminService.transfertPrivateMessage(message);
			}

			if (message.attachments.size > 0 && message.member.permissions.has("ADMINISTRATOR")) {
				if (message.attachments.some((att) => att.name.toLowerCase() === "reglement.txt")
					|| message.attachments.some((att) => att.name.toLowerCase() === "règlement.txt")) {
					this.logService.info("Upload du reglement demarre");
					await message.delete();
					await this.ruleService.processRulesFile(message.channel as TextChannel, message.attachments);
				}
			}
		}
		catch (error) {
			await this.logService.handlerError(error, message.client);
		}
	}
}
