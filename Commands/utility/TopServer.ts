import { Message, MessageEmbed, PermissionResolvable } from "discord.js";
import { ICommand } from "../ICommand";
import { CommandContext } from "../CommandContext";
import { ServiceProvider } from "../../src/ServiceProvider";
import { Player } from "../../Models/TopServerModel";
import { Config } from "../../Config/Config";
import { TopServerService } from "../../Services/TopServerService";

export class TopServerCommand implements ICommand {
	public readonly name: string = "topserveur";
	public readonly aliases: string[] = [ "classement" ];
	public readonly argumentIsNecessary: boolean = false;
	public readonly description: string = "Envoi le classement des votes de Top serveur du mois dernier ou courant";
	public readonly usage: string = "[last] (option facultative)";
	public readonly guildOnly: boolean = false;
	public readonly cooldown: number = 30;
	public readonly permission: PermissionResolvable = "ADMINISTRATOR";

	async run(commandContext: CommandContext): Promise<void> {
		const args: string[] = commandContext.args;
		const message: Message = commandContext.message;
		const topServerService: TopServerService = ServiceProvider.getTopServerService();

		let title: string;
		let players: Array<Player>;

		const option: string = args[0];

		if (option === "last") {
			players = await topServerService.getPlayersRanking(false);
			title = "Classement Top Serveur du mois dernier";
		}
		else {
			players = await topServerService.getPlayersRanking(true);
			title = "Classement Top Serveur du mois en cours";
		}

		const messageEmbed = new MessageEmbed()
			.attachFiles(["./Images/topServeur.png"])
			.setThumbnail("attachment://topServeur.png")
			.setTitle(title)
			.setColor(Config.color)
			.setTimestamp();

		players.map(p => {
			if (p.name === "") {
				messageEmbed.addField("Sans pseudo", `${p.votes.toString()}`, false);
			}
			else {
				messageEmbed.addField(`${p.name}`, `${p.votes.toString()}`, false);
			}
		});

		if (messageEmbed.length > 6000) {
			await message.author.send("Le résulat est trop volumineux pour être affiché");
		}
		else {
			await message.author.send(messageEmbed);
		}
	}
}