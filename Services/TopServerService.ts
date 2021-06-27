import { TopServerRepository } from "../Dal/TopServerRepository";
import { Player, TopServerModel } from "../Models/TopServerModel";


export class TopServerService {

    private _topServerRepository: TopServerRepository;

    constructor() {
        this._topServerRepository = new TopServerRepository();
    }

    public async getSlugTopServer(): Promise<TopServerModel> {
        try {
            const data = await this._topServerRepository.getDataServer();
            const topServerModel = this.MapTopServerModel(data);
            return topServerModel;
        } 
        catch (error) {
            throw error;
        }
    }

    public async getPlayersRanking(currentMonth: boolean): Promise<Player[]> {
        try {
            const data = await this._topServerRepository.getPlayersRanking(currentMonth);
            const model = new Array<Player>();
            data.players.map(e => {
                const player = new Player();
                player.name = e.playername;
                player.votes = e.votes;
                model.push(player);
            });
            return model;
        } 
        catch (error) {
            throw error;
        }
    }

    private MapTopServerModel(data) : TopServerModel {

        const model = new TopServerModel();
        if (data.server.slug) model.slug = data.server.slug;
        return model;
    }
}