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
		let roleStart: Role;

		if (Config.nodeEnv === "production") {
			const roleModel: RoleModel = await ServiceProvider.getRoleService().getStartRole();
			roleStart = await member.guild.roles.cache.get(roleModel.discordId);
		}
		else {
			roleStart = await member.guild.roles.cache.get(Config.roleStart);
		}

		if (roleStart) {
			await member.roles.add(roleStart);
			this._logService.log(`Attribution du role d'arrivée à ${roleStart.name} effectué`);
		}
		else {
			const adminService: AdminService = ServiceProvider.getAdminService();
			const admins: AdminModel[] = adminService.getAdmins();

			if (Config.nodeEnv === "production") {
				for (const admin of admins) {
					const user: GuildMember = await member.guild.members.fetch(admin.discordId);
					if (user) {
						await user.send(`Je n'ai pas réussi à attribuer le role d'arrivée à \`${member.user.username}\``);
					}
				}
			}
			else {
				const dev: GuildMember = await member.guild.members.cache.get(Config.devId);
				await dev.send(`Je n'ai pas réussi à attribuer le role d'arrivée à \`${member.user.username}\``);
			}

			this._logService.log(`Echec de l'attribution du role d'arrivée à ${member.displayName}`);
		}

		let welcomeChannel = member.guild.channels.cache.get(Config.welcomeChannel) as TextChannel;

		if (!welcomeChannel) {
			welcomeChannel = await member.guild.channels.fetch(Config.welcomeChannel) as TextChannel;
		}

		const welcomeEmbed = new MessageEmbed()
			.setColor(Config.color)
			.setThumbnail(member.user.displayAvatarURL())
			.setTitle(`:inbox_tray: ${member.user.username} a rejoint notre communauté`)
			.setDescription("Nous te souhaitons la bienvenue !")
			.setFooter(`Désormais, nous sommes ${member.guild.memberCount} membres`);

		await welcomeChannel.send({ embeds: [ welcomeEmbed ] });
	}
}