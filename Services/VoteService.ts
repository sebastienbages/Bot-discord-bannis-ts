import { Message, TextChannel } from "discord.js";
import { VoteRepository } from "../Dal/VoteRepository";
import { VoteModel } from "../Models/VoteModel";


export class VoteService {

    private _voteRepository: VoteRepository;

    constructor() {
        this._voteRepository = new VoteRepository();
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
            await this.deleteLastMessage(voteModel, message);
            await this._voteRepository.saveMessage(message.id);
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