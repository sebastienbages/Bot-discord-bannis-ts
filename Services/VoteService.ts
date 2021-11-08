import { Message, MessageEmbed, TextChannel } from "discord.js";
import { Config } from "../Config/Config";
import { VoteRepository } from "../Dal/VoteRepository";
import { TopServerModel } from "../Models/TopServerModel";
import { MessageModel } from "../Models/MessageModel";
import { TopServerService } from "./TopServerService";
import { AutoMapper } from "./AutoMapper";
import { WebhookProvider } from "../src/WebhookProvider";
import { LogService } from "./LogService";

// noinspection JSIgnoredPromiseFromCall
export class VoteService {

	private _voteRepository: VoteRepository;
	private _topServerService: TopServerService;
	private _messageModel: MessageModel;
	private _logService: LogService;

	constructor() {
		this._voteRepository = new VoteRepository();
		this._topServerService = new TopServerService();
		this._logService = new LogService();
		(async () => {
			await this.updateMessageId();
		})();
	}

	/**
	 * Retourne la configuration du message d'appel aux votes
	 * @private
	 */
	private async getMessage(): Promise<MessageModel> {
		const result: unknown = await this._voteRepository.getMessageVote();
		return AutoMapper.mapMessageModel(result);
	}

	/**
	 * Sauvegarde le message
	 * @param message {Message} - Message discord
	 */
	public async saveMessage(message: Message): Promise<void> {
		await this.deleteLastMessage(this._messageModel, message);
		await this._voteRepository.saveMessage(message.id);
		await this.updateMessageId();
	}

	/**
	 * Supprime le dernier message
	 * @param voteModel {MessageModel} - Configuration du message des votes
	 * @param message {Message} - Message à supprimer
	 * @private
	 */
	private async deleteLastMessage(voteModel: MessageModel, message: Message): Promise<void> {
		const channel = message.channel as TextChannel;

		if (channel) {
			const targetMessage: Message = await channel.messages.fetch(this._messageModel.messageId);
			if (targetMessage) {
				await targetMessage.delete();
			}
		}
	}

	/**
	 * Envoi le message d'appel aux votes
	 */
	public async sendMessage(): Promise<void> {
		const topServerModel: TopServerModel = await this._topServerService.getSlugTopServer();
		const numberOfVotes: number = await this._topServerService.getNumberOfVotes();
		const topServeurUrl: string = "https://top-serveurs.net/conan-exiles/vote/" + topServerModel.slug;

		const messageEmbed = new MessageEmbed()
			.setColor(Config.color)
			.setTitle("VOTEZ POUR LE SERVEUR")
			.setURL(topServeurUrl)
			.setThumbnail("https://top-serveurs.net/images/logo-base.png")
			.setDescription("N'hésitez pas à donner un coup de pouce au serveur en votant. Merci pour votre participation :thumbsup:")
			.addField("LIEN TOP SERVEUR", topServeurUrl)
			.setFooter(`Pour l'instant, nous avons ${numberOfVotes.toString()} votes ce mois-ci`);

		await WebhookProvider.getVoteKeeper().send({ embeds: [ messageEmbed ] });
		this._logService.log("Message des votes envoyé");
	}

	/**
	 * MAJ du cache contenant les informations du dernier message
	 * @private
	 */
	private async updateMessageId(): Promise<void> {
		this._messageModel = await this.getMessage();
	}
}