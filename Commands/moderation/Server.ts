import { ICommand } from "../ICommand";
import { Guild, PermissionResolvable, RoleManager } from "discord.js";
import { CommandContext } from "../CommandContext";
import { ServiceProvider } from "../../src/ServiceProvider";
import { RuleService } from "../../Services/RuleService";

export class RulesCommand implements ICommand {
	public readonly name: string = "rules";
	public readonly aliases: string[] = [ "règles", "règle", "rule" ];
	public readonly argumentIsNecessary: boolean = false;
	public readonly description: string = "Gestion des règles du serveur";
	public readonly usage: string = "[serveur]";
	public readonly guildOnly: boolean = true;
	public readonly cooldown: number = 0;
	public readonly permission: PermissionResolvable = "MANAGE_MESSAGES";

	private _ruleService: RuleService;

	constructor() {
		this._ruleService = ServiceProvider.getRuleService();
	}

	async run(commandContext: CommandContext): Promise<void> {
		const command: string = commandContext.args[0].toLowerCase();
		const guild: Guild = commandContext.message.guild;
		const roleManager: RoleManager = commandContext.message.guild.roles;

		if (command === "serveur") {
			await this._ruleService.addReactForServeurChoice(roleManager, guild, commandContext.message);
		}
	}
}