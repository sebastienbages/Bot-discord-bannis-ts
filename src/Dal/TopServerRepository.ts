import axios, { AxiosError } from "axios";
import { Config } from "../Config/Config";
import { TopServerError, TopServerPlayerRanking, TopServerInfos, TopServerStats } from "../Models/TopServerModel";
import { InteractionError } from "../Error/InteractionError";
import { URL } from "url";

export class TopServerRepository {
	private token: string;
	private baseUrl: string;
	private playerRankingUrl: string;
	private serverStatsUrl: string;

	public constructor() {
		this.token = Config.tokenTopServer;
		this.baseUrl = `https://api.top-serveurs.net/v1/servers/${this.token}`;
		this.playerRankingUrl = this.baseUrl + "/players-ranking";
		this.serverStatsUrl = this.baseUrl + "/stats";
	}

	/**
	 * Récupère les informations Top Serveur
	 */
	public async getDataServer(): Promise<TopServerInfos> {
		try {
			const response = await axios.get<TopServerInfos>(this.baseUrl.toString());
			return response.data;
		}
		catch (error) {
			const axiosError = error as AxiosError<TopServerError>;
			throw new InteractionError(
				`L'API de Top Serveur m'a retournée une erreur :weary:\nVoici son message : **${axiosError.response.data.message}**`,
				"getDataServer",
				axiosError.response.data.message
			);
		}
	}

	/**
	 * Récupère la liste des votants du mois courant et leur nombre de votes
	 */
	public async getPlayersRankingForCurrentMonth(): Promise<TopServerPlayerRanking> {
		try {
			const url = new URL(this.playerRankingUrl);
			url.searchParams.set("type", "current");
			const { data } = await axios.get<TopServerPlayerRanking>(url.toString());
			return data;
		}
		catch (error) {
			const axiosError = error as AxiosError<TopServerError>;
			throw new InteractionError(
				`L'API de Top Serveur m'a retournée une erreur :weary:\nVoici son message : **${axiosError.response.data.message}**`,
				"getPlayersRankingForCurrentMonth",
				axiosError.response.data.message
			);
		}
	}

	/**
	 * Récupère la liste des votants du mois dernier et leur nombre de votes
	 */
	public async getPlayersRankingForLastMonth(): Promise<TopServerPlayerRanking> {
		try {
			const url = new URL(this.playerRankingUrl);
			url.searchParams.set("type", "lastMonth");
			const { data } = await axios.get<TopServerPlayerRanking>(url.toString());
			return data;
		}
		catch (error) {
			const axiosError = error as AxiosError<TopServerError>;
			throw new InteractionError(
				`L'API de Top Serveur m'a retournée une erreur :weary:\nVoici son message : **${axiosError.response.data.message}**`,
				"getPlayersRankingForLastMonth",
				axiosError.response.data.message
			);
		}
	}

	/**
	 * Récupère les statistiques du serveur
	 */
	public async getServerStats(): Promise<TopServerStats> {
		try {
			const { data } = await axios.get<TopServerStats>(this.serverStatsUrl);
			return data;
		}
		catch (error) {
			const axiosError = error as AxiosError<TopServerError>;
			throw new InteractionError(
				`L'API de Top Serveur m'a retournée une erreur :weary:\nVoici son message : **${axiosError.response.data.message}**`,
				"getServerStats",
				axiosError.response.data.message
			);
		}
	}
}
