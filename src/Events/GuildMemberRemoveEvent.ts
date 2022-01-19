import { GuildMember, TextChannel, MessageEmbed } from "discord.js";
import { Config } from "../Config/Config";
import { LogService } from "../Services/LogService";

export class GuildMemberRemoveEvent {

	private _logService: LogService;

	constructor() {
		this._logService = new LogService();
	}

	public async run(member: GuildMember): Promise<void> {
		let departureChannel = member.guild.channels.cache.get(Config.departureChannel) as TextChannel;

		if (!departureChannel) {
			departureChannel = await member.guild.channels.fetch(Config.departureChannel) as TextChannel;
		}

		const departureMessage = new MessageEmbed()
			.setColor(Config.color)
			.setThumbnail(member.user.displayAvatarURL())
			.setTitle(`:outbox_tray: **${member.user.username} a quitté notre communauté**`)
			.setDescription(`Désormais, nous sommes ${member.guild.memberCount} membres`);
		await departureChannel.send({ embeds: [ departureMessage ] });
		this._logService.log(`Depart d'un membre : "${member.displayName}"`);
	}
}
