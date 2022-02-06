import { ISelectMenu } from "../../Interfaces/ISelectMenu";
import { GuildMember, MessageSelectMenu, MessageSelectOptionData, SelectMenuInteraction } from "discord.js";
import { RoleService } from "../../Services/RoleService";
import { ServicesProvider } from "../../ServicesProvider";
import { Config } from "../../Config/Config";
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
		this._logService = new LogService();
	}

	public async executeInteraction(selectMenuInteraction: SelectMenuInteraction): Promise<void> {
		await selectMenuInteraction.deferReply({ ephemeral: true, fetchReply: false });
		const guildMember = selectMenuInteraction.member as GuildMember;

		if (this._roleService.userHasRole(Config.roleStart, guildMember)) {
			for (const role of this._roleService.getServerRoles()) {
				if (this._roleService.userHasRole(role.discordId, guildMember)) {
					await selectMenuInteraction.followUp({ content: `Tu appartiens déjà au **${role.name}** :nerd:`, ephemeral: true, fetchReply: false });
					return;
				}
			}
		}

		const choice = selectMenuInteraction.values[0];

		if (choice === ServerSelectMenu.serverOneClose.value || choice === ServerSelectMenu.serverTwoClose.value) {
			await selectMenuInteraction.editReply({ content: "Ce serveur est plein :pleading_face:", attachments: [] });
			return;
		}

		await this._roleService.assignStartRole(selectMenuInteraction);
		let serverNumber;

		if (choice === ServerSelectMenu.serverOneOpen.value) {
			await this._roleService.assignServerOneRole(guildMember);
			serverNumber = "1";
		}

		if (choice === ServerSelectMenu.serverTwoOpen.value) {
			await this._roleService.assignServerTwoRole(guildMember);
			serverNumber = "2";
		}

		await selectMenuInteraction.editReply({ content: `Te voilà arrivé :partying_face: \nTu appartiens au **serveur ${serverNumber}** :sunglasses: \nD'ailleurs, je me suis permis de l'écrire à côté de ton pseudo :relaxed:`, attachments: [] });
		this._logService.log(`${guildMember.displayName} a commencé l'aventure`);
	}
}
