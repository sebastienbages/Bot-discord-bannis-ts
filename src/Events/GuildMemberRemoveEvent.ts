import { GuildMember, TextChannel, MessageEmbed } from "discord.js";
import { Config } from "../Config/Config";
import { LogService } from "../Services/LogService";
import { ServicesProvider } from "../ServicesProvider";

export class GuildMemberRemoveEvent {

	private logService: LogService;

	constructor() {
		this.logService = ServicesProvider.getLogService();
	}

	public async run(member: GuildMember): Promise<void> {
		try {
			const departureChannel = member.guild.channels.cache.get(Config.departureChannelId) as TextChannel
				|| await member.guild.channels.fetch(Config.departureChannelId) as TextChannel;

			if (!departureChannel) {
				await this.logService.toDeveloper(member.client, `Salon pour annoncer les départs introuvable suite au départ de ${member.displayName}`);
				return this.logService.info(`Salon pour annoncer les départs introuvable suite au départ de ${member.displayName}`);
			}

			const departureMessage = new MessageEmbed()
				.setColor(Config.color)
				.setThumbnail(member.user.displayAvatarURL())
				.setTitle(`:outbox_tray: **${member.user.username} a quitté notre communauté**`)
				.setDescription(`Désormais, nous sommes ${member.guild.memberCount} membres`);

			await departureChannel.send({ embeds: [ departureMessage ] });
			this.logService.info(`Depart d'un membre : "${member.displayName}"`);
		}
		catch (error) {
			await this.logService.handlerError(error, member.client);
		}
	}
}
