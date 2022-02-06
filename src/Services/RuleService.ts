import { RoleService } from "./RoleService";
import { LogService } from "./LogService";
import {
	CommandInteraction,
	MessageActionRow,
	MessageAttachment,
	MessageSelectMenu,
	TextChannel,
} from "discord.js";
import { ServerSelectMenu } from "../Interactions/SelectMenus/ServerSelectMenu";
import { Config } from "../Config/Config";

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
		const option = commandInteraction.options.getString("option") as string;
		const selectMenu: MessageSelectMenu = ServerSelectMenu.selectMenu;
		selectMenu.options = [];

		if (option === "s1") {
			selectMenu.addOptions([ ServerSelectMenu.serverOneOpen, ServerSelectMenu.serverTwoClose ]);
		}

		if (option === "s2") {
			selectMenu.addOptions([ ServerSelectMenu.serverOneClose, ServerSelectMenu.serverTwoOpen ]);
		}

		if (option === "all") {
			selectMenu.addOptions([ ServerSelectMenu.serverOneOpen, ServerSelectMenu.serverTwoOpen ]);
		}

		const image = new MessageAttachment(Config.imageDir + "/banderole.gif");
		const rowSelectMenu = new MessageActionRow().addComponents(selectMenu);

		try {
			await channel.send({ files: [ image ] });
			await channel.send({ content: "**CHOISI TON SERVEUR POUR VALIDER LE REGLEMENT :rocket:**", components: [ rowSelectMenu ] });
			await commandInteraction.editReply({ content: "J'ai bien envoyé le message pour le règlement :incoming_envelope:" });
		}
		catch (error) {
			throw Error("On dirait que le format du channel n'est pas correct :thinking:");
		}
	}
}
