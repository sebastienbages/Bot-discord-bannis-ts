import { ICommand } from "../ICommand";
import { PermissionResolvable } from "discord.js";
import { CommandContext } from "../CommandContext";
import { ServiceProvider } from "../../src/ServiceProvider";
import { RuleService } from "../../Services/RuleService";

export class RulesCommand implements ICommand {
	public readonly name: string = "rules";
	public readonly aliases: string[] = [ "règles", "règle", "rule" ];
	public readonly argumentIsNecessary: boolean = false;
	public readonly description: string = "Gestion des règles du serveur";
	public readonly usage: string = "[addsrv] / [rmsrv]";
	public readonly guildOnly: boolean = true;
	public readonly cooldown: number = 0;
	public readonly permission: PermissionResolvable = "MANAGE_MESSAGES";

	private _ruleService: RuleService;

	constructor() {
		this._ruleService = ServiceProvider.getRuleService();
	}

	async run(commandContext: CommandContext): Promise<void> {
		const command: string = commandContext.args[0].toLowerCase();

		if (command === "addsrv") {
			await this._ruleService.addReactForServeurChoice(commandContext.message);
		}

		if (command === "rmsrv") {
			await this._ruleService.removeReactForServeurChoice(commandContext.message);
		}
	}
}