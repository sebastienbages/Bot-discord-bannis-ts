import { SingletonContext } from "./Context";

export class AdminRepository {

    private readonly table = "admins";
    constructor() { }

    public async getAdminsData() {
        try {
            const connection = await SingletonContext.getInstance().getConnection();
            return new Promise((resolve, rejects) => {
                connection.query(`SELECT * FROM f1mtb0ah6rjbwawm.${this.table}`, (error, result) => {
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

    public async getAdmin(id: string) {
        try {
            const connection = await SingletonContext.getInstance().getConnection();
            return new Promise((resolve, rejects) => {
                connection.query(`SELECT * FROM f1mtb0ah6rjbwawm.${this.table} WHERE (discord_id = ?)`, [ id ], (error, result) => {
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

    public async createAdmin(id: string, name: string) {
        try {
            const connection = await SingletonContext.getInstance().getConnection();
            return new Promise((resolve, rejects) => {
                connection.query(`INSERT INTO f1mtb0ah6rjbwawm.${this.table} (discord_id, name) VALUES (?, ?)`, [ id, name ], (error, result) => {
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

    public async removeAdmin(id: string) {
        try {
            const connection = await SingletonContext.getInstance().getConnection();
            return new Promise((resolve, rejects) => {
                connection.query(`DELETE FROM f1mtb0ah6rjbwawm.${this.table} WHERE (discord_id = ?)`, [ id ], (error, result) => {
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