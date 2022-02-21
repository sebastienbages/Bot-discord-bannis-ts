import { RoleService } from "./RoleService";
import { LogService } from "./LogService";
import {
	CommandInteraction,
	MessageActionRow,
	MessageAttachment,
	TextChannel,
} from "discord.js";
import { Config } from "../Config/Config";
import { ValidationRulesButton } from "../Interactions/Buttons/ValidationRulesButton";
import { ServicesProvider } from "../ServicesProvider";

export class RuleService {
	private _roleService: RoleService;
	private _logService: LogService;

	constructor() {
		this._roleService = ServicesProvider.getRoleService();
		this._logService = ServicesProvider.getLogService();
	}

	/**
	 * Envoi le message permettant de choisir son serveur
	 * @param commandInteraction
	 */
	public async sendServerMessage(commandInteraction: CommandInteraction): Promise<void> {
		await commandInteraction.deferReply({ ephemeral: true, fetchReply: false });
		const channel = commandInteraction.options.getChannel("channel") as TextChannel;

		const image = new MessageAttachment(Config.imageDir + "/banderole.gif");
		const rowSelectMenu = new MessageActionRow().addComponents(ValidationRulesButton.button);

		try {
			await channel.send({ files: [ image ] });
			await channel.send({ content: "**VALIDER POUR COMMENCER L'AVENTURE :rocket:**", components: [ rowSelectMenu ] });
			await commandInteraction.editReply({ content: "J'ai bien envoyé le message pour le règlement :incoming_envelope:" });
		}
		catch (error) {
			throw Error("On dirait que le format du channel n'est pas correct :thinking:");
		}
	}
}
