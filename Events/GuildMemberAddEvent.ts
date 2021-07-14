import { GuildMember, MessageEmbed, Role, TextChannel } from "discord.js";
import { Config } from "../Config/Config";
import { AdminModel } from "../Models/AdminModel";
import { RoleModel } from "../Models/RoleModel";
import { AdminService } from "../Services/AdminService";
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
			const adminService: AdminService = await ServiceProvider.getAdminService();
			const admins: AdminModel[] = adminService.getAdmins();
			admins.map(admin => {
				const user: GuildMember = member.guild.members.cache.find(u => u.id === admin.discordId);
				if (admin) {
					user.send(`Je n'ai pas réussi à attribuer le role d'entrée à \`${member.user.username}\``);
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