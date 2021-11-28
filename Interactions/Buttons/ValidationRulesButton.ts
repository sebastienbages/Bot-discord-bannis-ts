import { IButton } from "../../Interfaces/IButton";
import {
	ButtonInteraction,
	GuildMember, MessageAttachment,
	MessageButton,
	MessageButtonStyleResolvable,
} from "discord.js";
import { RoleService } from "../../Services/RoleService";
import { ServicesProvider } from "../../src/ServicesProvider";
import { Config } from "../../Config/Config";
import util from "util";
import { LogService } from "../../Services/LogService";

export class ValidationRulesButton implements IButton {
	static readonly id: string = "validation_rules";
	static readonly label: string = "Démarrez l'aventure";
	static readonly style: MessageButtonStyleResolvable = "SUCCESS";
	static readonly button: MessageButton = new MessageButton()
		.setCustomId(this.id)
		.setLabel(this.label)
		.setStyle(this.style);

	public readonly customId: string;
	private _roleService: RoleService;
	private _logService: LogService;

	constructor() {
		this.customId = ValidationRulesButton.id;
		this._roleService = ServicesProvider.getRoleService();
		this._logService = new LogService();
	}

	public async executeInteraction(buttonInteraction: ButtonInteraction): Promise<void> {
		const guildMember = buttonInteraction.member as GuildMember;

		if (this._roleService.userHasRole(Config.roleStart, guildMember)) {
			return await buttonInteraction.reply({ content: "Je vois que le voyage en fusée t'a beaucoup plus :grin: :wink:", ephemeral: true, fetchReply: false });
		}

		const userHasServerOneRole = this._roleService.userHasRole(Config.serverRoleOne, guildMember);
		const userHasServerTwoRole = this._roleService.userHasRole(Config.serverRoleTwo, guildMember);

		if (!userHasServerOneRole && !userHasServerTwoRole) {
			return await buttonInteraction.reply({ content: "Tu dois choisir un serveur avant de commencer l'aventure :wink:", ephemeral: true, fetchReply: false });
		}

		await buttonInteraction.deferReply({ ephemeral: true, fetchReply: false });
		const wait = util.promisify(setTimeout);
		const teleportationImage = new MessageAttachment("./Images/teleportation.gif");
		await buttonInteraction.followUp({ content: "Ok c'est parti ! Accroche ta ceinture ça va secouer :rocket:", files: [ teleportationImage ], ephemeral: true, fetchReply: true });
		await wait(8000);
		await buttonInteraction.editReply({ content: "Te voilà arrivé :partying_face: ! Bienvenue parmis nous :raised_hands:", attachments: [] });
		await this._roleService.setRole(Config.roleStart, guildMember);
		await this._roleService.removeRole(Config.roleFrontiere, guildMember);
		return this._logService.log(`${guildMember.displayName} a commencé l'aventure`);
	}
}