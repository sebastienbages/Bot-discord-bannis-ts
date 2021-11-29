import { RoleService } from "./RoleService";
import { LogService } from "./LogService";
import {
	CommandInteraction,
	MessageActionRow, MessageAttachment,
	TextChannel,
} from "discord.js";
import { ServerSelectMenu } from "../Interactions/SelectMenus/ServerSelectMenu";

export class RuleService {
	private _roleService: RoleService;
	private _logService: LogService;

	constructor() {
		this._roleService = new RoleService();
		this._logService = new LogService();
	}

	/**
	 * Envoi le message permettant de choisir son serveur
	 * @param commandInteraction
	 */
	public async sendServerMessage(commandInteraction: CommandInteraction): Promise<void> {
		await commandInteraction.deferReply({ ephemeral: true, fetchReply: false });
		const channel = commandInteraction.options.getChannel("channel") as TextChannel;

		const image = new MessageAttachment("./Assets/banderole.gif");
		const rowSelectMenu = new MessageActionRow().addComponents(ServerSelectMenu.selectMenu);

		try {
			await channel.send({ files: [ image ] });
			await channel.send({ content: "**CHOISI TON SERVEUR POUR VALIDER LE REGLEMENT :rocket:**", components: [ rowSelectMenu ] });
			await commandInteraction.followUp({ content: "J'ai bien envoyé le message pour le règlement :incoming_envelope:" });
		}
		catch (error) {
			throw Error("On dirait que le format du channel n'est pas correct :thinking:");
		}
	}
}
