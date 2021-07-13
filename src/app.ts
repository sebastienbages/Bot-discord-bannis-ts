import { GuildMember, Message, MessageReaction, User } from 'discord.js';
import * as dotenv from 'dotenv';
import { Config } from '../Config/Config';
import { Bot } from './Bot';
import { CommandHandler } from './CommandHandler';
import { Events } from './Events';

dotenv.config();

const bot: Bot = new Bot();
bot.start();

const commandHandler = new CommandHandler(process.env.PREFIX);
const events = new Events();

try {
    bot.client.on("message", (message: Message) => commandHandler.handleMessage(message, bot.client));
    bot.client.on("messageReactionAdd", (messageReaction: MessageReaction, user: User) => events.messageReactionAdd().run(messageReaction, user));
    bot.client.on("guildMemberAdd", (member: GuildMember) => events.guildMemberAdd().run(member));
    bot.client.on("guildMemberRemove", (member: GuildMember) => events.guildMemberRemove().run(member));
} 
catch (error) {
    console.error(error);
    const devBot = bot.client.users.fetch(Config.devId).then(user => user.send("Une erreur s'est produite avec le bot"));
}