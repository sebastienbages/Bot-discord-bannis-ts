import { TopServerRepository } from "../Dal/TopServerRepository";
import { Player, TopServerModel } from "../Models/TopServerModel";


export class TopServerService {

	private _topServerRepository: TopServerRepository;

	constructor() {
		this._topServerRepository = new TopServerRepository();
	}

	public async getSlugTopServer(): Promise<TopServerModel> {
		const data = await this._topServerRepository.getDataServer();
		const topServerModel = this.MapTopServerModel(data);
		return topServerModel;
	}

	public async getPlayersRanking(currentMonth: boolean): Promise<Player[]> {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const data: any = await this._topServerRepository.getPlayersRanking(currentMonth);
		const model: Player[] = new Array<Player>();
		data.players.map(e => {
			const player = new Player();
			player.name = e.playername;
			player.votes = e.votes;
			model.push(player);
		});
		return model;
	}

	public async GetNumberOfVotes(): Promise<number> {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const stats: any = await this._topServerRepository.getServerStats();
		const date: number = new Date().getMonth();
		const months: string[] = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december" ];
		const currentMonth: string = months[date];
		return stats.monthly[0][currentMonth + "_votes"];
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private MapTopServerModel(data: any) : TopServerModel {

		const model: TopServerModel = new TopServerModel();
		if (data.server.slug) model.slug = data.server.slug;
		return model;
	}
}