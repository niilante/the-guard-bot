'use strict';

// DB
const { getCommand } = require('../../stores/command');

const runCustomCmdHandler = async (ctx, next) => {
	const { message, state } = ctx;
	const { isAdmin, isMaster } = state;
	const isCommand = message.entities &&
		message.entities.filter(entity => entity.type === 'bot_command');
	if (!isCommand || !isCommand.length) {
		return next();
	}

	const commandName = message.text.split(' ')[0].replace('/', '');
	const command = await getCommand({ isActive: true, name: commandName });

	if (!command) {
		return next();
	}

	const { caption, content, role, type } = command;
	const replyTo = message.reply_to_message
		? { reply_to_message_id: message.reply_to_message.message_id }
		: {};
	const options = Object.assign(replyTo, caption ? { caption } : {});
	if (
		role === 'Master' &&
		!isMaster ||
		role === 'Admins' &&
		!isAdmin
	) {
		return next();
	}

	if (type === 'text') {
		ctx.replyWithHTML(content, options);
		return next();
	}
	if (type === 'photo') {
		ctx.replyWithPhoto(content, options);
		return next();
	}
	if (type === 'video') {
		ctx.replyWithVideo(content, replyTo);
		return next();
	}
	if (type === 'document') {
		ctx.replyWithDocument(content, replyTo);
		return next();
	}
	if (type === 'audio') {
		ctx.replyWithAudio(content, replyTo);
		return next();
	}
	return next();
};

module.exports = runCustomCmdHandler;