import { TicketModel } from "../Models/TicketModel";
import { TicketConfigModel } from "../Models/TicketConfigModel";
import { RoleModel } from "../Models/RoleModel";
import { AdminModel } from "../Models/AdminModel";
import { Player, TopServerModel } from "../Models/TopServerModel";
import { VoteModel } from "../Models/VoteModel";

export class AutoMapper {
	public static mapTicketModel(data: any): TicketModel {
		const model: TicketModel = new TicketModel();

		data.map(e => {
			if (e.userid) model.userId = e.userid;
			model.number = e.number;
			if (e.isclosed === 0) model.isClosed = false;
			if (e.isclosed === 1) model.isClosed = true;
		});

		return model;
	}

	/**
	 * Retourne la configuration du gestionnaire de tickets
	 * @param data
	 */
	public static mapTicketConfigModel(data: any): TicketConfigModel {
		const model: TicketConfigModel = new TicketConfigModel();

		data.map(e => {
			model.LastNumber = e.last_number;
			if (e.category_id) model.CategoryId = e.category_id;
			if (e.channel_id) model.ChannelId = e.channel_id;
			if (e.message_id) model.MessageId = e.message_id;
		});

		return model;
	}

	/**
	 * Retourne un tableau de Roles
	 * @param data
	 */
	public static mapArrayRoleModel(data: any): RoleModel[] {
		const rolesArray: RoleModel[] = new Array<RoleModel>();

		data.forEach(e => {
			const model: RoleModel = new RoleModel();

			if (e.name) model.name = e.name;
			if (e.role_id) model.discordId = e.role_id;
			if (e.ticket === 0) model.isForTicket = false;
			if (e.ticket === 1) model.isForTicket = true;

			rolesArray.push(model);
		});

		return rolesArray;
	}

	/**
	 * Retourne un Role
	 * @param data
	 */
	public static mapRoleModel(data: any): RoleModel {
		const roleModel: RoleModel = new RoleModel();
		const element: any = data[0];
		if (element.name) roleModel.name = element.name;
		if (element.role_id) roleModel.discordId = element.role_id;
		if (element.ticket === 0) roleModel.isForTicket = false;
		if (element.ticket === 1) roleModel.isForTicket = true;
		return roleModel;
	}

	/**
	 * Retourne un tableau d'administrateurs
	 * @param data
	 */
	public static mapArrayAdminModel(data: any): AdminModel[] {
		const adminArray: AdminModel[] = new Array<AdminModel>();

		data.forEach(e => {
			const model: AdminModel = new AdminModel();

			if (e.name) model.name = e.name;
			if (e.discord_id) model.discordId = e.discord_id;

			adminArray.push(model);
		});

		return adminArray;
	}

	/**
	 * Retourne un objet Top Serveur
	 * @param data
	 */
	public static mapTopServerModel(data: any) : TopServerModel {
		const model: TopServerModel = new TopServerModel();
		if (data.server.slug) model.slug = data.server.slug;
		return model;
	}

	/**
	 * Retourne un tableau de joueurs Top Serveur
	 * @param data
	 */
	public static mapArrayPlayer(data: any): Player[] {
		const playersModel: Player[] = new Array<Player>();
		data.players.map(e => {
			const player = new Player();
			player.name = e.playername;
			player.votes = e.votes;
			playersModel.push(player);
		});
		return playersModel;
	}

	/**
	 * Retourne un objet Vote
	 * @param data
	 */
	public static mapVoteModel(data: any): VoteModel {
		const model: VoteModel = new VoteModel();

		data.map(e => {
			if (e.name) model.name = e.name;
			if (e.message_id) model.messageId = e.message_id;
			if (e.channel_id) model.channelId = e.channel_id;
		});

		return model;
	}
}