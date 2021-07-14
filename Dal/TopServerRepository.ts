/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { Config } from "../Config/Config";

export class TopServerRepository {

	private readonly _token: string = Config.tokenTopServer;
	private readonly _url: string = "https://api.top-serveurs.net/v1/servers/" + this._token;

	public async getDataServer(): Promise<unknown> {
		const { data } = await axios.get(this._url);
		return data;
	}

	public async getPlayersRanking(currentMonth = true): Promise<any> {
		let url: string;

		if (currentMonth) {
			url = this._url + "/players-ranking";
		}
		else {
			url = this._url + "/players-ranking?type=lastMonth";
		}

		const { data } = await axios.get(url);
		return data;
	}

	public async getServerStats(): Promise<any> {
		const { data } = await axios.get(this._url + "/stats");
		return data.stats;
	}
}