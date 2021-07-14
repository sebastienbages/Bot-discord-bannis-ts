import { Message, MessageEmbed, TextChannel, WebhookClient } from "discord.js";
import { Config, WebHookConfig } from "../Config/Config";
import { VoteRepository } from "../Dal/VoteRepository";
import { TopServerModel } from "../Models/TopServerModel";
import { VoteModel } from "../Models/VoteModel";
import { TopServerService } from "./TopServerService";


export class VoteService {

	private _voteRepository: VoteRepository;
	private _topServerService: TopServerService;

	constructor() {
		this._voteRepository = new VoteRepository();
		this._topServerService = new TopServerService();
	}

	private async getMessage(): Promise<VoteModel> {
		const result: unknown = await this._voteRepository.getMessageVote();
		const voteModel: VoteModel = this.MapVoteModel(result);
		return voteModel;
	}

	public async saveMessage(message: Message): Promise<void> {
		const voteModel: VoteModel = await this.getMessage();
		this.deleteLastMessage(voteModel, message);
		this._voteRepository.saveMessage(message.id);
	}

	private async deleteLastMessage(voteModel: VoteModel, message: Message) {
		const channel = message.guild.channels.cache.find(c => c.id === voteModel.channelId) as TextChannel;

		if (channel) {
			const targetMessage: Message = await channel.messages.fetch(voteModel.messageId);
			targetMessage.delete();
		}
	}

	public async sendMessage(): Promise<void> {
		const webhook: WebhookClient = new WebhookClient(WebHookConfig.voteKeeperId, WebHookConfig.voteKeeperToken);

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

		await webhook.send(messageEmbed);
	}

	public MapVoteModel(data: any): VoteModel {
		const model: VoteModel = new VoteModel();

		data.map(e => {
			if (e.name) model.name = e.name;
			if (e.message_id) model.messageId = e.message_id;
			if (e.channel_id) model.channelId = e.channel_id;
		});

		return model;
	}
}