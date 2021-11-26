import { ISelectMenu } from "../../Interfaces/ISelectMenu";
import { MessageSelectMenu, SelectMenuInteraction } from "discord.js";
import { RoleService } from "../../Services/RoleService";
import { ServicesProvider } from "../../src/ServicesProvider";

export class ServerSelectMenu implements ISelectMenu {
	static readonly id: string = "choice_server";
	static readonly placeholder: string = "Choisi ton serveur";
	static readonly serverOne: string = "choice_serverOne";
	static readonly serverTwo: string = "choice_serverTwo";
	static readonly selectMenu: MessageSelectMenu = new MessageSelectMenu()
		.setCustomId(this.id)
		.setPlaceholder(this.placeholder)
		.addOptions([
			{
				label: "Serveur 1",
				description: "Serveur PVE avec cohérence d'univers demandé",
				value: this.serverOne,
			},
			{
				label: "Serveur 2",
				description: "Serveur PVE SEMI/RP (encouragé mais pas imposé)",
				value: this.serverTwo,
			},
		]);

	public readonly customId: string;
	private _roleService: RoleService;

	constructor() {
		this.customId = ServerSelectMenu.id;
		this._roleService = ServicesProvider.getRoleService();
	}

	public async executeInteraction(selectMenuInteraction: SelectMenuInteraction): Promise<void> {
		return await this._roleService.assignServerRole(selectMenuInteraction);
	}
}