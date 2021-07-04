import { Client, Message, MessageEmbed } from "discord.js";
import { Config } from "../Config/Config";
import { AdminRepository } from "../Dal/AdminRepository";
import { AdminModel } from "../Models/AdminModel";

export class AdminService {

    private _adminRepository: AdminRepository;

    constructor() {
        this._adminRepository = new AdminRepository();
    }

    public async getAdminsData(): Promise<Array<AdminModel>> {
        try {
            const results = await this._adminRepository.getAdminsData();
            const adminsArray = this.MapAdminModel(results);
            return adminsArray;
        } 
        catch (error) {
            throw error;    
        }
    }

    public async getAdminsId(): Promise<Array<string>> {
        try {
            const adminsArray = await this.getAdminsData();
            const adminsId = new Array<string>();
            adminsArray.forEach(e => adminsId.push(e.discordId));
            return adminsId;
        } 
        catch (error) {
            throw error;    
        }
    }

    public async getAdminsNames(): Promise<Array<string>> {
        try {
            const adminsArray = await this.getAdminsData();
            const adminsNames = new Array<string>();
            adminsArray.forEach(e => adminsNames.push(e.name));
            return adminsNames;
        } 
        catch (error) {
            throw error;    
        }
    }

    public async adminIsExist(id: string): Promise<Boolean> {
        try {
            const adminsArray = await this.getAdminsData();

            adminsArray.forEach(e => {
                if (e.discordId === id) return true;
            });

            return false;
        } 
        catch (error) {
            throw error;    
        }
    }

    public async transfertPrivateMessage(message: Message): Promise<void> {
        try {
            const admins = await this.getAdminsId();

			const messageEmbed = new MessageEmbed()
				.setColor(Config.color)
				.setTitle('MESSAGE PRIVE RECU')
				.setThumbnail(message.author.displayAvatarURL())
				.addField('AUTEUR', message.author.username)
				.addField('MESSAGE', message.content)
				.setTimestamp();

			admins.map(id => {
				const admin = message.client.users.cache.find(user => user.id === id);
				if (admin) {
					admin.send(messageEmbed);
				}
			});
        } 
        catch (error) {
            throw error;    
        }
    }

    public MapAdminModel(data): Array<AdminModel> {
        try {
                const adminArray = new Array<AdminModel>();

                data.forEach(e => {
                    const model = new AdminModel();
    
                    if (e.name) model.name = e.name;
                    if (e.discord_id) model.discordId = e.discord_id;

                    adminArray.push(model);
                });

                return adminArray;
        } 
        catch (error) {
            throw error;    
        }
    }
}