import { RoleService } from "./RoleService";
import { LogService } from "./LogService";
import {
	CommandInteraction,
	MessageActionRow, MessageAttachment,
	TextChannel,
} from "discord.js";
import { ValidationRulesButton } from "../Interactions/Buttons/ValidationRulesButton";
import { ServerSelectMenu } from "../Interactions/SelectMenus/ServerSelectMenu";

export class RuleService {
	private _roleService: RoleService;
	private _logService: LogService;

	constructor() {
		this._roleService = new RoleService();
		this._logService = new LogService();
	}

	public async sendServerMessage(commandInteraction: CommandInteraction): Promise<void> {
		const channel = commandInteraction.options.getChannel("channel") as TextChannel;

		const image = new MessageAttachment("./Images/banderole.gif");
		const rowButton = new MessageActionRow().addComponents(ValidationRulesButton.button);
		const rowSelectMenu = new MessageActionRow().addComponents(ServerSelectMenu.selectMenu);

		try {
			await channel.send({ files: [ image ] });
			await channel.send({ content: "**CHOISI TON SERVEUR ET DEMARRE TON AVENTURE :rocket:**", components: [ rowSelectMenu, rowButton ] });
			return commandInteraction.reply({ content: "J'ai bien envoyé le message pour le règlement :incoming_envelope:", ephemeral: true, fetchReply: false });
		}
		catch (error) {
			throw Error("On dirait que le format du channel n'est pas correct :thinking:");
		}
	}
}
