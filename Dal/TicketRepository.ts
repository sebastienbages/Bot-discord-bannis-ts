import { SingletonContext } from "./Context";

export class TicketRepository {

    private readonly table = "ticketconfig";

    constructor() { }

    public async getAllData() {
        try {
            const connection = await SingletonContext.getInstance().getConnection();
            return new Promise((resolve, rejects) => {
                connection.query(`SELECT * FROM f1mtb0ah6rjbwawm.${this.table} WHERE (id = 1)`, (error, result) => {
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

    public async saveTicketMessageId(messageId: string)
    {
        try {
            const connection = await SingletonContext.getInstance().getConnection();
            return new Promise((resolve, rejects) => {
                connection.query(`UPDATE f1mtb0ah6rjbwawm.${this.table} SET message_id = ? WHERE (id = 1)`, [ messageId ], (error, result) => {
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

    public async saveTicketNumber(number: string)
    {
        try {
            const connection = await SingletonContext.getInstance().getConnection();
            return new Promise((resolve, rejects) => {
                connection.query(`UPDATE f1mtb0ah6rjbwawm.${this.table} SET last_number = ? WHERE (id = 1)`, [ number ], (error, result) => {
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