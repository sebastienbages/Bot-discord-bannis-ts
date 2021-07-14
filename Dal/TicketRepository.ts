import { SingletonContext } from "./Context";

export class TicketRepository {

    private readonly table = "tickets";

    constructor() { }

    public async saveTicket(userId: string, number: number): Promise<object> {
        try {
            const connection = await SingletonContext.getInstance().getConnection();
            return new Promise((resolve, rejects) => {
                connection.query(`INSERT INTO f1mtb0ah6rjbwawm.${this.table} (userid, number) VALUES (?, ?)`, [ userId, number ], (error, result) => {
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

    public async getTicketByNumber(number: number): Promise<object> {
        try {
            const connection = await SingletonContext.getInstance().getConnection();
            return new Promise((resolve, rejects) => {
                connection.query(`SELECT * FROM f1mtb0ah6rjbwawm.${this.table} WHERE number = ?`, [ number ], (error, result) => {
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

    public async getTicketByUserId(userId: string): Promise<object> {
        try {
            const connection = await SingletonContext.getInstance().getConnection();
            return new Promise((resolve, rejects) => {
                connection.query(`SELECT * FROM f1mtb0ah6rjbwawm.${this.table} WHERE userid = ?`, [ userId ], (error, result) => {
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

    public async closeTicket(userId: string): Promise<object> {
        try {
            const connection = await SingletonContext.getInstance().getConnection();
            return new Promise((resolve, rejects) => {
                connection.query(`UPDATE f1mtb0ah6rjbwawm.${this.table} SET isclosed = "1" WHERE (userid = ?)`, [ userId ], (error, result) => {
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

    public async openTicket(userId: string): Promise<object> {
        try {
            const connection = await SingletonContext.getInstance().getConnection();
            return new Promise((resolve, rejects) => {
                connection.query(`UPDATE f1mtb0ah6rjbwawm.${this.table} SET isclosed = "0" WHERE (userid = ?)`, [ userId ], (error, result) => {
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

    public async deleteTicket(number: number): Promise<object> {
        try {
            const connection = await SingletonContext.getInstance().getConnection();
            return new Promise((resolve, rejects) => {
                connection.query(`DELETE FROM f1mtb0ah6rjbwawm.${this.table} WHERE (number = ?)`, [ number ], (error, result) => {
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