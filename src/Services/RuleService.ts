import { RoleService } from "./RoleService";
import { LogService } from "./LogService";
import {
	ButtonInteraction,
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

export class RuleService {
	private roleService: RoleService;
	private logService: LogService;

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
		await channel.send({ files: [ image ] });
		await channel.send({ content: "**VALIDER POUR COMMENCER L'AVENTURE :rocket:**", components: [ rowSelectMenu ] });
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
}
