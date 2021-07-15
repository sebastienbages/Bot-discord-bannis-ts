import { Message, MessageEmbed } from "discord.js";
import { Config } from "../Config/Config";
import { AdminRepository } from "../Dal/AdminRepository";
import { AdminModel } from "../Models/AdminModel";
import { AutoMapper } from "./AutoMapper";

export class AdminService {

	private _adminRepository: AdminRepository;
	private _admins: AdminModel[];

	constructor() {
		this._adminRepository = new AdminRepository();
		this.updateAdmins();
	}

	private async getAdminsData(): Promise<AdminModel[]> {
		const results: unknown = await this._adminRepository.getAdminsData();
		return AutoMapper.mapArrayAdminModel(results);
	}

	public getAdmins(): AdminModel[] {
		return this._admins;
	}

	public async adminIsExist(id: string): Promise<boolean> {
		let result = false;
		this._admins.forEach(admin => {
			if (admin.discordId === id) result = true;
		});
		return result;
	}

	public async transfertPrivateMessage(message: Message): Promise<void> {
		const messageEmbed = new MessageEmbed()
			.setColor(Config.color)
			.setTitle("MESSAGE PRIVE RECU")
			.setThumbnail(message.author.displayAvatarURL())
			.addField("AUTEUR", message.author.username)
			.addField("MESSAGE", message.content)
			.setTimestamp();

		this._admins.map(admin => {
			const user = message.client.users.cache.find(a => a.id === admin.discordId);
			if (user) {
				user.send(messageEmbed);
			}
		});
	}

	public async createAdmin(id: string, name: string): Promise<void> {
		await this._adminRepository.createAdmin(id, name);
		await this.updateAdmins();
	}

	public async removeAdmin(id: string): Promise<void> {
		await this._adminRepository.removeAdmin(id);
		await this.updateAdmins();
	}

	private async updateAdmins(): Promise<void> {
		this._admins = await this.getAdminsData();
	}
}