import { GuildMember, MessageEmbed, TextChannel } from "discord.js";
import { Config } from "../Config/Config";

export class GuildMemberRemoveEvent {

	public async run(member: GuildMember): Promise<void> {
		console.log(`Détection du départ du joueur "${member.displayName}"`);
		const welcomechannel = member.guild.channels.cache.find(channel => channel.id === process.env.CHA_WELCOME) as TextChannel;

		const goodByeEmbed = new MessageEmbed()
			.setColor(Config.color)
			.setThumbnail(member.user.displayAvatarURL())
			.setTitle(`:outbox_tray: ${member.user.username} a quitté notre communauté`)
			.setDescription("Au-revoir et à bientôt !")
			.setFooter(`Désormais, nous sommes ${member.guild.memberCount} membres`);

		await welcomechannel.send(goodByeEmbed);
		console.log("Traitement du départ effectué");
	}
}