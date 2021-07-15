import { TopServerRepository } from "../Dal/TopServerRepository";
import { Player, TopServerModel } from "../Models/TopServerModel";
import { AutoMapper } from "./AutoMapper";

export class TopServerService {
	private _topServerRepository: TopServerRepository;

	constructor() {
		this._topServerRepository = new TopServerRepository();
	}

	public async getSlugTopServer(): Promise<TopServerModel> {
		const result: any = await this._topServerRepository.getDataServer();
		return AutoMapper.mapTopServerModel(result);
	}

	public async getPlayersRanking(currentMonth: boolean): Promise<Player[]> {
		const results: any = await this._topServerRepository.getPlayersRanking(currentMonth);
		return AutoMapper.mapArrayPlayer(results);
	}

	public async GetNumberOfVotes(): Promise<number> {
		const stats: any = await this._topServerRepository.getServerStats();
		const date: number = new Date().getMonth();
		const months: string[] = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december" ];
		const currentMonth: string = months[date];
		return stats.monthly[0][currentMonth + "_votes"];
	}
}