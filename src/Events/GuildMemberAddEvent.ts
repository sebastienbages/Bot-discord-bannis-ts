import {
	GuildMember,
	MessageActionRow,
	MessageAttachment, MessageButton,
	MessageEmbed,
	TextChannel,
} from "discord.js";
import { Config } from "../Config/Config";
import { AdminModel } from "../Models/AdminModel";
import { AdminService } from "../Services/AdminService";
import { ServicesProvider } from "../ServicesProvider";
import { LogService } from "../Services/LogService";

export class GuildMemberAddEvent {

	private _logService: LogService;

	constructor() {
		this._logService = new LogService();
	}

	public async run(member: GuildMember): Promise<void> {
		this._logService.log(`Arrivee d'un nouveau membre : ${member.displayName}`);
		const roleStart = await member.guild.roles.cache.get(Config.roleFrontiere);

		if (roleStart) {
			await member.roles.add(roleStart);
			this._logService.log(`Attribution du role ${roleStart.name} effectue`);
		}
		else {
			const adminService: AdminService = ServicesProvider.getAdminService();
			const admins: AdminModel[] = adminService.getAdmins();

			if (Config.nodeEnv === "production") {
				for (const admin of admins) {
					const user: GuildMember = await member.guild.members.fetch(admin.discordId);
					if (user) {
						await user.send(`Je n'ai pas reussi à attribuer le role d'arrivee à \`${member.user.username}\``);
					}
				}
			}
			else {
				const dev: GuildMember = await member.guild.members.cache.get(Config.devId);
				await dev.send(`Je n'ai pas réussi à attribuer le role d'arrivée à \`${member.user.username}\``);
			}

			this._logService.log(`Echec de l'attribution du role d'arrive a ${member.displayName}`);
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

		let borderChannel = member.guild.channels.cache.get(Config.borderChannel) as TextChannel;

		if (!borderChannel) {
			borderChannel = await member.guild.channels.fetch(Config.borderChannel) as TextChannel;
		}

		const logo = new MessageAttachment("./Assets/logo-bannis.png");
		const rulesChannel = member.guild.channels.cache.get(Config.rulesChannelId) as TextChannel;

		const actionRow = new MessageActionRow().addComponents(
			new MessageButton()
				.setStyle("LINK")
				.setLabel("Où ?")
				.setURL(`https://discord.com/channels/${Config.guildId}/${Config.rulesChannelId}/${rulesChannel.lastMessageId}`)
		);

		const borderMessageEmbed = new MessageEmbed()
			.setColor(Config.color)
			.setThumbnail("attachment://logo-bannis.png")
			.setTitle("BIENVENUE")
			.setDescription(`Bien le bonjour **${member.displayName}** ! \n
							Consulte les salons ouverts pour en apprendre d'avantage sur le contenu des Bannis. Tu peux poser tes questions à notre équipe dans ce salon si tu as besoin :wink:. \n
							Pour accéder à la totalité du discord, nous te remercions de prendre connaissance du <#${Config.rulesChannelId}>. \n
							Ensuite, il ne te restera plus qu'à choisir ton serveur dans la liste :ok_hand:
			`);

		await borderChannel.send({ content: `<@${member.user.id}>`, embeds: [ borderMessageEmbed ], files: [ logo ], components: [ actionRow ] });
	}
}
