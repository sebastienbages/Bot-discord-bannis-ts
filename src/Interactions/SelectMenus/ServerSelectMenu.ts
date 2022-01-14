import { ISelectMenu } from "../../Interfaces/ISelectMenu";
import { GuildMember, MessageSelectMenu, SelectMenuInteraction } from "discord.js";
import { RoleService } from "../../Services/RoleService";
import { ServicesProvider } from "../../ServicesProvider";
import { Config } from "../../Config/Config";
import { LogService } from "../../Services/LogService";

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
	private _logService: LogService;

	constructor() {
		this.customId = ServerSelectMenu.id;
		this._roleService = ServicesProvider.getRoleService();
		this._logService = new LogService();
	}

	public async executeInteraction(selectMenuInteraction: SelectMenuInteraction): Promise<void> {
		await selectMenuInteraction.deferReply({ ephemeral: true, fetchReply: false });
		const guildMember = selectMenuInteraction.member as GuildMember;

		if (!this._roleService.userHasRole(Config.roleStart, guildMember)) {
			await this._roleService.assignStartRole(selectMenuInteraction);
			const serverNumber = await this._roleService.assignServerRole(selectMenuInteraction);
			await selectMenuInteraction.editReply({ content: `Te voilà arrivé :partying_face: \nTu appartiens au **serveur ${serverNumber}** :sunglasses: \nD'ailleurs, je me suis permis de l'écrire à côté de ton pseudo :relaxed:`, attachments: [] });
			this._logService.log(`${guildMember.displayName} a commencé l'aventure`);
		}
		else {
			for (const role of this._roleService.getServerRoles()) {
				if (this._roleService.userHasRole(role.discordId, guildMember)) {
					await selectMenuInteraction.followUp({ content: `Tu appartiens déjà au **${role.name}** :nerd:`, ephemeral: true, fetchReply: false });
					return;
				}
			}

			const serverNumber = await this._roleService.assignServerRole(selectMenuInteraction);
			await selectMenuInteraction.editReply({ content: `Tu appartiens désormais au **serveur ${serverNumber}** :sunglasses: \nD'ailleurs, je me suis permis de l'écrire à côté de ton pseudo :relaxed:` });
		}
	}
}
