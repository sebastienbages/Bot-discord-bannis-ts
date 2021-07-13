import { Message, MessageEmbed, TextChannel, WebhookClient } from "discord.js";
import { Config, WebHookConfig } from "../Config/Config";
import { VoteRepository } from "../Dal/VoteRepository";
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
        try {
            const result = await this._voteRepository.getMessageVote();
            const voteModel = this.MapVoteModel(result);
            return voteModel;
        } 
        catch (error) {
            throw error;    
        }
    }

    public async saveMessage(message: Message) {
        try {
            const voteModel = await this.getMessage();
            this.deleteLastMessage(voteModel, message);
            this._voteRepository.saveMessage(message.id);
        } 
        catch (error) {
            throw error;    
        }
    }

    private async deleteLastMessage(voteModel: VoteModel, message: Message) {
        try {
            const channel = message.guild.channels.cache.find(c => c.id === voteModel.channelId) as TextChannel;

            if (channel) {
                const message = await channel.messages.fetch(voteModel.messageId);
                message.delete();
            }
        } 
        catch (error) {
            throw error;    
        }
    }

    public async sendMessage(): Promise<void> {
        try {
            const webhook = new WebhookClient(WebHookConfig.voteKeeperId, WebHookConfig.voteKeeperToken);

            const topServerModel = await this._topServerService.getSlugTopServer();
			const numberOfVotes = await this._topServerService.GetNumberOfVotes();
			const topServeurUrl = "https://top-serveurs.net/conan-exiles/vote/" + topServerModel.slug;

            const messageEmbed = new MessageEmbed()
				.setColor(Config.color)
				.setTitle('VOTEZ POUR LE SERVEUR')
				.setURL(topServeurUrl)
				.attachFiles(['./images/topServeur.png'])
				.setThumbnail('attachment://topServeur.png')
				.setDescription('N\'hésitez pas à donner un coup de pouce au serveur en votant. Merci pour votre participation :thumbsup:')
				.addField('LIEN TOP SERVEUR', topServeurUrl)
				.setFooter(`Pour l'instant, nous avons ${numberOfVotes.toString()} votes ce mois-ci`);

			await webhook.send(messageEmbed);
        } 
        catch (error) {
            throw error;    
        }
    }

    public MapVoteModel(data): VoteModel {
        try {
            const model = new VoteModel();

            data.map(e => {
                if (e.name) model.name = e.name;
                if (e.message_id) model.messageId = e.message_id;
                if (e.channel_id) model.channelId = e.channel_id;
            });

            return model;
        } 
        catch (error) {
            throw error;    
        }
    }
}