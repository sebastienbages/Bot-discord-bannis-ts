import { ISelectMenu } from "../../Interfaces/ISelectMenu";
import { MessageSelectMenu, MessageSelectOptionData, SelectMenuInteraction } from "discord.js";
import { RoleService } from "../../Services/RoleService";
import { ServicesProvider } from "../../ServicesProvider";
import { LogService } from "../../Services/LogService";

export class ServerSelectMenu implements ISelectMenu {
	static readonly id: string = "choice_server";
	static readonly placeholder: string = "Choisi ton serveur";
	static readonly serverOneOpen: MessageSelectOptionData = { label: "Serveur 1", value: "serverOne_open" };
	static readonly serverOneClose: MessageSelectOptionData = { label: "Serveur 1 (Plein)", value: "serverOne_close" };
	static readonly serverTwoOpen: MessageSelectOptionData = { label: "Serveur 2", value: "serverTwo_open" };
	static readonly serverTwoClose: MessageSelectOptionData = { label: "Serveur 2 (Plein)", value: "serverTwo_close" };
	static readonly selectMenu: MessageSelectMenu = new MessageSelectMenu()
		.setCustomId(this.id)
		.setPlaceholder(this.placeholder);

	public readonly customId: string;
	private _roleService: RoleService;
	private _logService: LogService;

	constructor() {
		this.customId = ServerSelectMenu.id;
		this._roleService = ServicesProvider.getRoleService();
		this._logService = ServicesProvider.getLogService();
	}

	public async executeInteraction(selectMenuInteraction: SelectMenuInteraction): Promise<void> {
		return Promise.resolve();
	}
}
