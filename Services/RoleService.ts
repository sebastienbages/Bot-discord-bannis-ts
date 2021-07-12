import { Message, MessageEmbed } from "discord.js";
import { Config } from "../Config/Config";
import { RoleRepository } from "../Dal/RoleRepository";
import { RoleModel } from "../Models/RoleModel";

export class RoleService {

    private _roleRepository: RoleRepository;

    constructor() {
        this._roleRepository = new RoleRepository();
    }

    public async getStartRole(): Promise<RoleModel> {
        try {
            const result = await this._roleRepository.getStartRole();
            const roles = this.mapRoleModel(result);
            return roles[0];
        } 
        catch (error) {
            throw error;    
        }
    }

    public async getTicketRoles(): Promise<Array<RoleModel>> {
        try {
            const results = await this._roleRepository.getTicketRoles();
            const roles = this.mapRoleModel(results);
            return roles;
        } 
        catch (error) {
            throw error;    
        }
    }

    public mapRoleModel(data): Array<RoleModel> {
        try {
            const rolesArray = new Array<RoleModel>();

            data.forEach(e => {
                const model = new RoleModel();

                if (e.name) model.name = e.name;
                if (e.role_id) model.discordId = e.role_id;
                if (e.ticket === 0) model.isForTicket = false;
                if (e.ticket === 1) model.isForTicket = true;

                rolesArray.push(model);
            });

            return rolesArray;
    } 
    catch (error) {
        throw error;    
    }
    }
}