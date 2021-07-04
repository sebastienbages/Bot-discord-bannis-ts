import { SingletonContext } from "./Context";

export class VoteRepository {

    constructor() { }

    public async getMessageVote() {
        try {
            const connection = await SingletonContext.getInstance().getConnection();
            return new Promise((resolve, rejects) => {
                connection.query("SELECT * FROM f1mtb0ah6rjbwawm.messages WHERE name = \"vote\"", (error, result) => {
                    if (error) return rejects(error);
                    connection.release();
                    return resolve(result);
                });
            });
        } 
        catch (error) {
            throw error;
        }
    }

    public async saveMessage(messageId: string) {
        try {
            const connection = await SingletonContext.getInstance().getConnection();
            return new Promise((resolve, rejects) => {
                connection.query("UPDATE f1mtb0ah6rjbwawm.messages SET message_id = ? WHERE (name = \"vote\")", [ messageId ], (error, result) => {
                    if (error) return rejects(error);
                    connection.release();
                    return resolve(result);
                });
            });
        } 
        catch (error) {
            throw error;    
        }
    }
}