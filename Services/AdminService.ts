import { Message, MessageEmbed } from "discord.js";
import { Config } from "../Config/Config";
import { AdminRepository } from "../Dal/AdminRepository";
import { AdminModel } from "../Models/AdminModel";

export class AdminService {

	private _adminRepository: AdminRepository;

	constructor() {
		this._adminRepository = new AdminRepository();
	}

	public async getAdminsData(): Promise<AdminModel[]> {
		const results: unknown = await this._adminRepository.getAdminsData();
		const adminsArray: AdminModel[] = this.MapAdminModel(results);
		return adminsArray;
	}

	public async getAdminsId(): Promise<string[]> {
		const adminsArray: AdminModel[] = await this.getAdminsData();
		const adminsId: string[] = new Array<string>();
		adminsArray.forEach(e => adminsId.push(e.discordId));
		return adminsId;
	}

	public async getAdminsNames(): Promise<string[]> {
		const adminsArray: AdminModel[] = await this.getAdminsData();
		const adminsNames: string[] = new Array<string>();
		adminsArray.forEach(e => adminsNames.push(e.name));
		return adminsNames;
	}

	public async adminIsExist(id: string): Promise<boolean> {
		const results: unknown = await this._adminRepository.getAdmin(id);
		const admin: AdminModel[] = this.MapAdminModel(results);

		if (admin.length === 0) return false;

		if (admin[0].discordId === id) {
			return true;
		}

		return false;
	}

	public async transfertPrivateMessage(message: Message): Promise<void> {
		const admins: string[] = await this.getAdminsId();

		const messageEmbed = new MessageEmbed()
			.setColor(Config.color)
			.setTitle("MESSAGE PRIVE RECU")
			.setThumbnail(message.author.displayAvatarURL())
			.addField("AUTEUR", message.author.username)
			.addField("MESSAGE", message.content)
			.setTimestamp();

		admins.map(id => {
			const admin = message.client.users.cache.find(user => user.id === id);
			if (admin) {
				admin.send(messageEmbed);
			}
		});
	}

	public async createAdmin(id: string, name: string): Promise<void> {
		await this._adminRepository.createAdmin(id, name);
	}

	public async removeAdmin(id: string): Promise<void> {
		await this._adminRepository.removeAdmin(id);
	}

	public MapAdminModel(data: any): Array<AdminModel> {
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