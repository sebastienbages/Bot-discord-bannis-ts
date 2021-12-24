import { GuildMember, TextChannel } from "discord.js";
import { Config } from "../Config/Config";
import { LogService } from "../Services/LogService";

export class GuildMemberRemoveEvent {

	private _logService: LogService;

	constructor() {
		this._logService = new LogService();
	}

	public async run(member: GuildMember): Promise<void> {
		this._logService.log(`Depart d'un membre : "${member.displayName}"`);

		let welcomeChannel = member.guild.channels.cache.get(Config.welcomeChannel) as TextChannel;

		if (!welcomeChannel) {
			welcomeChannel = await member.guild.channels.fetch(Config.welcomeChannel) as TextChannel;
		}
		await welcomeChannel.send(
			{
				content: `_${member.user.username} a quitté notre communauté, au-revoir et à bientôt_ :wave:`,
			});
	}
}
