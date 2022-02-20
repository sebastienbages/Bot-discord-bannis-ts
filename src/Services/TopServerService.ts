import { TopServerRepository } from "../Dal/TopServerRepository";
import * as fs from "fs/promises";
import { LogService } from "./LogService";
import { ServicesProvider } from "../ServicesProvider";
import { Player, TopServerPlayerRanking, TopServerInfos } from "../Models/TopServerModel";
import * as Stream from "stream";

export class TopServerService {
	private topServerRepository: TopServerRepository;
	private logService: LogService;
	public static fileName = "topserveur.txt";

	constructor() {
		this.topServerRepository = new TopServerRepository();
		this.logService = ServicesProvider.getLogService();
	}

	/**
	 * Retourne le nom du serveur sous Top Serveur
	 */
	public async getSlugTopServer(): Promise<TopServerInfos> {
		return await this.topServerRepository.getDataServer();
	}

	/**
	 * Retourne la liste des votants du mois courant et le nombre de votes
	 */
	public async getPlayersRankingForCurrentMonth(): Promise<TopServerPlayerRanking> {
		return await this.topServerRepository.getPlayersRankingForCurrentMonth();
	}

	/**
	 * Retourne la liste des votants du mois courant et le nombre de votes
	 */
	public async getPlayersRankingForLastMonth(): Promise<TopServerPlayerRanking> {
		return await this.topServerRepository.getPlayersRankingForLastMonth();
	}

	/**
	 * Retourne le total des votes pour le mois courant
	 * @constructor
	 */
	public async getNumberOfVotes(): Promise<number> {
		const serverStats = await this.topServerRepository.getServerStats();
		const date = new Date();
		const stats = serverStats.stats.monthly.find((s) => s.year === date.getFullYear());
		const months: string[] = [ "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december" ];
		const currentMonth: string = months[date.getMonth()];
		return stats[currentMonth + "_votes"];
	}

	/**
	 * Créer un fichier avec le classement des votes
	 * @param players {Player[]}
	 */
	public async createRankingFile(players: Player[]): Promise<void> {
		return new Promise((resolve, reject) => {
			let number = 1;

			const reader = Stream.Readable.from(players);
			const writer = new Stream.Writable(
				{
					objectMode: true,
					async write(player: Player, encoding: BufferEncoding, done: (error?: (Error | null)) => void) {
						try {
							if (player.playername === "") {
								player.playername = "Sans pseudo";
							}
							await fs.appendFile(TopServerService.fileName, `${number.toString()} - ${player.playername} - ${player.votes} votes \n`);
							number += 1;
							done();
						}
						catch (err) {
							done(err);
						}
					},
				}
			);

			Stream.pipeline(reader, writer, (err) => {
				if (err) {
					return reject(err);
				}

				return resolve();
			});
		});
	}
}
