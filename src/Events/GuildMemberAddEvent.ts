import {
	GuildMember,
	MessageActionRow,
	MessageAttachment,
	MessageButton,
	MessageEmbed,
	TextChannel,
} from "discord.js";
import { Config } from "../Config/Config";
import { AdminModel } from "../Models/AdminModel";
import { AdminService } from "../Services/AdminService";
import { ServicesProvider } from "../ServicesProvider";
import { LogService } from "../Services/LogService";
import * as Canvas from "canvas";

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

		Canvas.registerFont(Config.fontsDir + "/hyborian2.ttf", { family: "Hyborian" });
		const welcomeBanner = Canvas.createCanvas(1500, 800);
		const context = welcomeBanner.getContext("2d");
		const background = await Canvas.loadImage(Config.imageDir + "/banniere_new_player.png");
		context.drawImage(background, 0, 0, welcomeBanner.width, welcomeBanner.height);

		context.font = "65px Hyborian";
		context.fillStyle = "#ffffff";
		const textDimensions = context.measureText(member.displayName);
		context.fillText(member.displayName, (750 - (textDimensions.width / 2)), 560);
		const subtitle = "a rejoint notre communauté";
		const subtitleDimensions = context.measureText(subtitle);
		context.fillText(subtitle, (750 - (subtitleDimensions.width / 2)), 620);

		context.beginPath();
		context.arc(750, 340, 150, 0, Math.PI * 2, true);
		context.closePath();
		context.clip();

		const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: "jpg" }));
		context.drawImage(avatar, 600, 190, 300, 300);

		const attachment = new MessageAttachment(welcomeBanner.toBuffer(), "welcome-profile-image.png");
		await welcomeChannel.send({ files: [attachment] });

		let borderChannel = member.guild.channels.cache.get(Config.borderChannel) as TextChannel;

		if (!borderChannel) {
			borderChannel = await member.guild.channels.fetch(Config.borderChannel) as TextChannel;
		}

		const logo = new MessageAttachment(Config.imageDir + "/logo-bannis.png");
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
