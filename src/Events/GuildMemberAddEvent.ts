import {
	GuildMember,
	MessageActionRow,
	MessageAttachment,
	MessageButton, Role,
	TextChannel,
} from "discord.js";
import { Config } from "../Config/Config";
import { AdminModel } from "../Models/AdminModel";
import { AdminService } from "../Services/AdminService";
import { ServicesProvider } from "../ServicesProvider";
import { LogService } from "../Services/LogService";
import * as Canvas from "canvas";

export class GuildMemberAddEvent {

	private logService: LogService;
	private adminService: AdminService;

	constructor() {
		this.logService = ServicesProvider.getLogService();
		this.adminService = ServicesProvider.getAdminService();
	}

	public async run(member: GuildMember): Promise<void> {
		try {
			this.logService.info(`Arrivee d'un nouveau membre : ${member.displayName}`);

			const roleStart = await member.guild.roles.cache.get(Config.roleFrontiereId) as Role
				|| await member.guild.roles.fetch(Config.roleFrontiereId) as Role;

			if (!roleStart && Config.nodeEnv === Config.nodeEnvValues.production) {
				const admins: AdminModel[] = this.adminService.getAdmins();
				for (const admin of admins) {
					const user: GuildMember = await member.guild.members.fetch(admin.discord_id);
					await user.send({ content: `Je n'ai pas reussi à attribuer le role d'arrivee à '${member.user.username}'` });
				}
				this.logService.info(`Echec de l'attribution du role d'arrive a ${member.displayName}`);
				await member.send({ content: "Je n'ai pas réussi à te donner le role pour accéder au discord :confounded:" +
						"\nLes admins sont prévenus, cela devrait s'arranger sous peu :thumbsup:" +
						"\nMerci pour ta patience.",
				});
			}
			else {
				await member.roles.add(roleStart);
				this.logService.info(`Attribution du role ${roleStart.name} effectue`);
			}

			const welcomeChannel = member.guild.channels.cache.get(Config.welcomeChannel) as TextChannel
				|| await member.guild.channels.fetch(Config.welcomeChannel) as TextChannel;

			if (!welcomeChannel) {
				await this.logService.toDeveloper(member.client, `Salon de bienvenue introuvable lors de l'arrivé du joueur ${member.displayName}`);
				return this.logService.info("Salon textuel de bienvenue introuvable");
			}
			else {
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

				const actionRow = new MessageActionRow();

				const rulesChannel = member.guild.channels.cache.get(Config.rulesChannelId) as TextChannel
					|| await member.guild.channels.fetch(Config.rulesChannelId) as TextChannel;

				if (rulesChannel) {
					actionRow.addComponents(
						new MessageButton()
							.setStyle("LINK")
							.setLabel("Règlement à valider")
							.setEmoji("📜")
							.setURL(`https://discord.com/channels/${Config.guildId}/${Config.rulesChannelId}/${rulesChannel.lastMessageId}`)
					);
				}

				actionRow.addComponents(
					new MessageButton()
						.setStyle("LINK")
						.setLabel("Si tu as des questions")
						.setEmoji("❔")
						.setURL(`https://discord.com/channels/${Config.guildId}/${Config.borderChannelId}`)
				);

				await welcomeChannel.send({ files: [attachment] });
				await welcomeChannel.send({ content: `<@${member.id}>`, components: [actionRow] });
			}
		}
		catch (error) {
			await this.logService.handlerError(error, member.client);
		}
	}
}
