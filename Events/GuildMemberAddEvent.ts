import { GuildMember, MessageEmbed, Role, TextChannel } from "discord.js";
import { Config } from "../Config/Config";
import { RoleModel } from "../Models/RoleModel";
import { ServiceProvider } from "../src/ServiceProvider";

export class GuildMemberAddEvent {

	public async run(member: GuildMember): Promise<void> {
		console.log(`Détection de l'arrivée du joueur "${member.displayName}"`);
		const roleStart: RoleModel = await ServiceProvider.getRoleService().getStartRole();
		const role: Role = member.guild.roles.cache.find(r => r.id === roleStart.discordId);

		if (role) {
			await member.roles.add(role);
			console.log(`Attribution du role "${role.name}" effectué`);
		}
		else {
			console.log("Echec de l'attribution du role");
			const adminsId: string[] = await ServiceProvider.getAdminService().getAdminsId();
			adminsId.map(id => {
				const admin: GuildMember = member.guild.members.cache.find(user => user.id === id);
				if (admin) {
					admin.send(`Je n'ai pas réussi à attribuer le role d'entrée à \`${member.user.username}\``);
				}
			});
		}

		const welcomeChannel = member.guild.channels.cache.find(channel => channel.id === process.env.CHA_WELCOME) as TextChannel;

		const welcomeEmbed = new MessageEmbed()
			.setColor(Config.color)
			.setThumbnail(member.user.displayAvatarURL())
			.setTitle(`:inbox_tray: ${member.user.username} a rejoins notre communauté`)
			.setDescription("Nous te souhaitons la bienvenue !")
			.setFooter(`Désormais, nous sommes ${member.guild.memberCount} membres`);

		await welcomeChannel.send(welcomeEmbed);
		console.log("Traitement de l'arrivée effectuée");
	}
}