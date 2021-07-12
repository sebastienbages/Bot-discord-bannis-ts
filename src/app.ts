import { Message, MessageReaction, User } from 'discord.js';
import * as dotenv from 'dotenv';
import { Bot } from './Bot';
import { CommandHandler } from './CommandHandler';
import { Events } from './Events';

dotenv.config();

const bot: Bot = new Bot();
bot.start();

const commandHandler = new CommandHandler(process.env.PREFIX);
const events = new Events();

bot.client.on("message", (message: Message) => commandHandler.handleMessage(message, bot.client));
bot.client.on("messageReactionAdd", (messageReaction: MessageReaction, user: User) => events.messageReactionAdd().run(messageReaction, user));