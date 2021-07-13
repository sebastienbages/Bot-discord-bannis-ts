import { SingletonContext } from "./Context";

export class RoleRepository {

    private readonly table = "roles";

    constructor() { }

    public async getStartRole() {
        try {
            const connection = await SingletonContext.getInstance().getConnection();
            return new Promise((resolve, rejects) => {
                connection.query(`SELECT role_id FROM f1mtb0ah6rjbwawm.${this.table} WHERE name = "start"`, (error, result) => {
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

    public async getTicketRoles() {
        try {
            const connection = await SingletonContext.getInstance().getConnection();
            return new Promise((resolve, rejects) => {
                connection.query(`SELECT role_id FROM f1mtb0ah6rjbwawm.${this.table} WHERE ticket = "1"`, (error, result) => {
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