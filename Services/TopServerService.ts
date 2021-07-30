import { TopServerRepository } from "../Dal/TopServerRepository";
import { Player, TopServerModel } from "../Models/TopServerModel";
import { AutoMapper } from "./AutoMapper";
import * as fs from "fs";
import { appendFileSync, WriteStream } from "fs";

export class TopServerService {
	private _topServerRepository: TopServerRepository;
	public readonly fileName: string = "topserveur.txt";

	constructor() {
		this._topServerRepository = new TopServerRepository();
	}

	/**
	 * Retourne le nom du serveur sous Top Serveur
	 */
	public async getSlugTopServer(): Promise<TopServerModel> {
		const result: any = await this._topServerRepository.getDataServer();
		return AutoMapper.mapTopServerModel(result);
	}

	/**
	 * Retourne la liste des votants et le nombre de votes
	 * @param currentMonth {boolean} - True = mois courant / False = mois N-1
	 */
	public async getPlayersRanking(currentMonth: boolean): Promise<Player[]> {
		const results: any = await this._topServerRepository.getPlayersRanking(currentMonth);
		return AutoMapper.mapArrayPlayer(results);
	}

	/**
	 * Retourne le total des votes pour le mois courant
	 * @constructor
	 */
	public async getNumberOfVotes(): Promise<number> {
		const stats: any = await this._topServerRepository.getServerStats();
		const date: number = new Date().getMonth();
		const months: string[] = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december" ];
		const currentMonth: string = months[date];
		return stats.monthly[0][currentMonth + "_votes"];
	}

	/**
	 * Créer un fichier avec le classement des votes
	 * @param players {Player[]}
	 */
	public async createRankingFile(players: Player[]) {
		let number: number = 1;
		players.map(async player => {
			if (player.name === "") player.name = "Sans pseudo";
			fs.appendFileSync(this.fileName, `${number.toString()} - ${player.name} - ${player.votes} votes \n`);
			number++;
		})
	}
}