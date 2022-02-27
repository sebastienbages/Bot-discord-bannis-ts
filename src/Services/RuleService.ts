import { RoleService } from "./RoleService";
import { LogService } from "./LogService";
import {
	ButtonInteraction,
	Collection,
	CommandInteraction,
	GuildMember,
	MessageActionRow,
	MessageAttachment,
	TextChannel,
} from "discord.js";
import { Config } from "../Config/Config";
import { ValidationRulesButton } from "../Interactions/Buttons/ValidationRulesButton";
import { ServicesProvider } from "../ServicesProvider";
import { InteractionError } from "../Error/InteractionError";
import { Stream } from "stream";
import * as https from "https";

export class RuleService {
	private roleService: RoleService;
	private logService: LogService;
	private static readonly imagePattern = "[image]";

	constructor() {
		this.roleService = ServicesProvider.getRoleService();
		this.logService = ServicesProvider.getLogService();
	}

	/**
	 * Envoi le message permettant de choisir son serveur
	 * @param commandInteraction
	 */
	public async sendServerMessage(commandInteraction: CommandInteraction): Promise<void> {
		await commandInteraction.deferReply({ ephemeral: true, fetchReply: false });
		const channel = commandInteraction.options.getChannel("channel") as TextChannel;

		if (channel.type !== "GUILD_TEXT") {
			throw new InteractionError(
				"Choisi un channel textuel voyons :grin:",
				commandInteraction.commandName,
				`Le channel ${channel.name} ne possede pas le bon type`
			);
		}

		const image = new MessageAttachment(Config.imageDir + "/banderole.gif");
		const rowSelectMenu = new MessageActionRow().addComponents(ValidationRulesButton.button);
		await channel.send({ files: [ image ], components: [ rowSelectMenu ] });
		await commandInteraction.editReply({ content: "J'ai bien envoyé le message pour le règlement :incoming_envelope:" });
		return this.logService.info(`Message du reglement envoye dans le salon ${channel.name}`);
	}

	/**
	 * Valide le règlement pour l'émetteur de l'interaction
	 * @param buttonInteraction
	 */
	public async validateRules(buttonInteraction: ButtonInteraction): Promise<void> {
		await buttonInteraction.deferReply({ ephemeral: true, fetchReply: false });
		const guildMember = buttonInteraction.member as GuildMember;

		if (this.roleService.userHasRole(Config.roleStartId, guildMember)) {
			throw new InteractionError(
				"Tu as déjà validé le règlement :nerd:",
				buttonInteraction.customId,
				"Reglement deja valide"
			);
		}

		await this.roleService.assignStartRole(buttonInteraction);
		await buttonInteraction.editReply({ content: "Te voilà arrivé :partying_face: \nProfite bien de l'aventure des bannis :thumbsup:", attachments: [] });
		this.logService.info(`${guildMember.displayName} a commence l'aventure`);
	}

	/**
	 * Traite le fichier du reglement et le publie dans le salon textuel fourni
	 * @param channel
	 * @param attachements
	 */
	public async processRulesFile(channel: TextChannel, attachements: Collection<string, MessageAttachment>): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				const banner = new MessageAttachment(Config.imageDir + "/banderole.gif");
				channel.send({ files: [ banner ] });

				const rulesFile = attachements.find((a) => a.name.toLowerCase() === "reglement.txt" || a.name.toLowerCase() === "règlement.txt");
				attachements.delete(rulesFile.id);

				const highWaterMark = 15 * 1024;
				let lastLineFragment = "";
				const transformStream = new Stream.Transform(
					{
						objectMode: true,
						transform(chunk: string, encoding, done) {
							try {
								const str = `${lastLineFragment}${chunk.toString()}`;
								const lines = str.split(/\n|\r\n|\r/g);
								lastLineFragment = lines.pop() || "";
								done(null, lines);
							}
							catch (error) {
								done(error);
							}
						},
						flush(done) {
							try {
								if (lastLineFragment !== "") {
									const line = [lastLineFragment.trim()];
									done(null, line);
								}
								else {
									done();
								}
							}
							catch (err) {
								done(err);
							}
						},
					}
				);

				const writeStream = new Stream.Writable(
					{
						objectMode: true,
						highWaterMark: highWaterMark,
						async write(chunk: string[], encoding, done) {
							try {
								while (chunk.includes(RuleService.imagePattern) && attachements.size > 0) {
									const index = chunk.indexOf(RuleService.imagePattern);
									const remain = chunk.splice(index);
									remain.shift();
									const image = attachements.first();
									await channel.send({ content: chunk.join("\n"), files: [ image.attachment ] });
									attachements.delete(image.id);
									chunk = remain;
								}

								if (chunk.length > 0) {
									await channel.send({ content: chunk.join("\n") });
								}

								done();
							}
							catch (error) {
								done(error);
							}
						},
						async final(done) {
							try {
								const rowSelectMenu = new MessageActionRow().addComponents(ValidationRulesButton.button);
								await channel.send({ components: [ rowSelectMenu ] });
							}
							catch (error) {
								done(error);
							}
						},
					}
				);

				https.get(rulesFile.attachment as string, (res) => {
					Stream.pipeline(res, transformStream, writeStream, (err) => {
						if (err) {
							return reject(err);
						}
						this.logService.info("Ecriture du reglement termine avec succes");
						return resolve();
					});
				});
			}
			catch (error) {
				return reject(error);
			}
		});
	}
}
