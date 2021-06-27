import axios from "axios";

export class TopServerRepository {

    private readonly _token = process.env.TOKEN_TOP_SERVEUR;
    private readonly _url = 'https://api.top-serveurs.net/v1/servers/' + this._token;

    constructor() { }

    public async getDataServer() {
        try {
            const { data } = await axios.get(this._url);
            return data;
        } 
        catch (error) {
            throw error;
        }
    }

    public async getPlayersRanking(currentMonth = true) {
        try {
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
        catch (error) {
            throw error;
        }
    }
}