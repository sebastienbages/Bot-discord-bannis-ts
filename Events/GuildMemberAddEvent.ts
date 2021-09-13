import { GuildMember, MessageEmbed, Role, TextChannel } from "discord.js";
import { Config } from "../Config/Config";
import { AdminModel } from "../Models/AdminModel";
import { RoleModel } from "../Models/RoleModel";
import { AdminService } from "../Services/AdminService";
import { ServiceProvider } from "../src/ServiceProvider";
import { LogService } from "../Services/LogService";

export class GuildMemberAddEvent {

	private _logService: LogService;

	constructor() {
		this._logService = new LogService();
	}

	public async run(member: GuildMember): Promise<void> {
		this._logService.log(`Arrivée d'un nouveau membre : ${member.displayName}`);

		const roleStart: RoleModel = await ServiceProvider.getRoleService().getStartRole();
		const role: Role = member.guild.roles.cache.find(r => r.id === roleStart.discordId);

		if (role) {
			await member.roles.add(role);
			this._logService.log(`Attribution du role d'arrivée à ${role.name} effectué`);
		}
		else {
			const adminService: AdminService = ServiceProvider.getAdminService();
			const admins: AdminModel[] = adminService.getAdmins();
			admins.map(admin => {
				const user: GuildMember = member.guild.members.cache.find(u => u.id === admin.discordId);
				if (admin) {
					user.send(`Je n'ai pas réussi à attribuer le role d'arrivée à \`${member.user.username}\``);
				}
			});
			this._logService.log(`Echec de l'attribution du role d'arrivée à ${member.displayName}`);
		}

		const welcomeChannel = member.guild.channels.cache.find(channel => channel.id === process.env.CHA_WELCOME) as TextChannel;

		const welcomeEmbed = new MessageEmbed()
			.setColor(Config.color)
			.setThumbnail(member.user.displayAvatarURL())
			.setTitle(`:inbox_tray: ${member.user.username} a rejoint notre communauté`)
			.setDescription("Nous te souhaitons la bienvenue !")
			.setFooter(`Désormais, nous sommes ${member.guild.memberCount} membres`);

		await welcomeChannel.send(welcomeEmbed);
	}
}