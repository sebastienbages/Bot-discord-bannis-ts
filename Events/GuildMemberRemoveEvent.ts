import { GuildMember, MessageEmbed, TextChannel } from "discord.js";
import { Config } from "../Config/Config";
import { LogService } from "../Services/LogService";

export class GuildMemberRemoveEvent {

	private _logService: LogService;

	constructor() {
		this._logService = new LogService();
	}

	public async run(member: GuildMember): Promise<void> {
		this._logService.log(`Départ d'un membre : "${member.displayName}"`);

		const welcomeChannel = member.guild.channels.cache.find(channel => channel.id === process.env.CHA_WELCOME) as TextChannel;

		const goodByeEmbed = new MessageEmbed()
			.setColor(Config.color)
			.setThumbnail(member.user.displayAvatarURL())
			.setTitle(`:outbox_tray: ${member.user.username} a quitté notre communauté`)
			.setDescription("Au-revoir et à bientôt !")
			.setFooter(`Désormais, nous sommes ${member.guild.memberCount} membres`);

		await welcomeChannel.send(goodByeEmbed);
	}
}