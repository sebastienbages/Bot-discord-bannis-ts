import { Message, MessageEmbed } from "discord.js";
import { Config } from "../Config/Config";
import { AdminRepository } from "../Dal/AdminRepository";
import { AdminModel } from "../Models/AdminModel";

export class AdminService {

	private _adminRepository: AdminRepository;
	private _admins: AdminModel[];

	constructor() {
		this._adminRepository = new AdminRepository();
	}

	private async getAdminsData(): Promise<AdminModel[]> {
		const results: unknown = await this._adminRepository.getAdminsData();
		const adminsArray: AdminModel[] = this.MapAdminModel(results);
		return adminsArray;
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

	public async updateAdmins(): Promise<void> {
		this._admins = await this.getAdminsData();
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private MapAdminModel(data: any): Array<AdminModel> {
		const adminArray: AdminModel[] = new Array<AdminModel>();

		data.forEach(e => {
			const model: AdminModel = new AdminModel();

			if (e.name) model.name = e.name;
			if (e.discord_id) model.discordId = e.discord_id;

			adminArray.push(model);
		});

		return adminArray;
	}
}