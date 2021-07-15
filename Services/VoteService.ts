import { Message, MessageEmbed, TextChannel, WebhookClient } from "discord.js";
import { Config } from "../Config/Config";
import { VoteRepository } from "../Dal/VoteRepository";
import { TopServerModel } from "../Models/TopServerModel";
import { VoteModel } from "../Models/VoteModel";
import { TopServerService } from "./TopServerService";
import { AutoMapper } from "./AutoMapper";
import { WebhookProvider } from "../src/WebhookProvider";


export class VoteService {

	private _voteRepository: VoteRepository;
	private _topServerService: TopServerService;

	constructor() {
		this._voteRepository = new VoteRepository();
		this._topServerService = new TopServerService();
	}

	private async getMessage(): Promise<VoteModel> {
		const result: unknown = await this._voteRepository.getMessageVote();
		return AutoMapper.mapVoteModel(result);
	}

	public async saveMessage(message: Message): Promise<void> {
		const voteModel: VoteModel = await this.getMessage();
		await this.deleteLastMessage(voteModel, message);
		await this._voteRepository.saveMessage(message.id);
	}

	private async deleteLastMessage(voteModel: VoteModel, message: Message) {
		const channel = message.guild.channels.cache.find(c => c.id === voteModel.channelId) as TextChannel;

		if (channel) {
			const targetMessage: Message = await channel.messages.fetch(voteModel.messageId);
			await targetMessage.delete();
		}
	}

	public async sendMessage(): Promise<void> {
		const topServerModel: TopServerModel = await this._topServerService.getSlugTopServer();
		const numberOfVotes: number = await this._topServerService.GetNumberOfVotes();
		const topServeurUrl: string = "https://top-serveurs.net/conan-exiles/vote/" + topServerModel.slug;

		const messageEmbed = new MessageEmbed()
			.setColor(Config.color)
			.setTitle("VOTEZ POUR LE SERVEUR")
			.setURL(topServeurUrl)
			.attachFiles(["./images/topServeur.png"])
			.setThumbnail("attachment://topServeur.png")
			.setDescription("N'hésitez pas à donner un coup de pouce au serveur en votant. Merci pour votre participation :thumbsup:")
			.addField("LIEN TOP SERVEUR", topServeurUrl)
			.setFooter(`Pour l'instant, nous avons ${numberOfVotes.toString()} votes ce mois-ci`);

		await WebhookProvider.getVoteKeeper().send(messageEmbed);
	}
}