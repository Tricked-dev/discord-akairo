const { APIMessage, Collection } = require("discord.js");

/**
 * Command utilities.
 * @param {CommandHandler} handler - The command handler.
 * @param {Message} message - Message that triggered the command.
 */
class CommandUtil {
	constructor(handler, message) {
		/**
		 * The command handler.
		 * @type {CommandHandler}
		 */
		this.handler = handler;

		/**
		 * Message that triggered the command.
		 * @type {Message | AkairoMessage}
		 */
		this.message = message;

		/**
		 * The parsed components.
		 * @type {?ParsedComponentData}
		 */
		this.parsed = null;

		/**
		 * Whether or not the last response should be edited.
		 * @type {boolean}
		 */
		this.shouldEdit = false;

		/**
		 * The last response sent.
		 * @type {?Message | ?RawMessage | ?}
		 */
		this.lastResponse = null;

		if (this.handler.storeMessages) {
			/**
			 * Messages stored from prompts and prompt replies.
			 * @type {Collection<Snowflake, Message>}
			 */
			this.messages = new Collection();
		} else {
			this.messages = null;
		}

		/**
		 * Whether or not the command is a slash command.
		 * @type {boolean}
		 */
		this.isSlash = !!message.interaction;
	}

	/**
	 * Sets the last response.
	 * @param {Message | Message[]} message - Message to set.
	 * @returns {Message}
	 */
	setLastResponse(message) {
		if (Array.isArray(message)) {
			this.lastResponse = message.slice(-1)[0];
		} else {
			this.lastResponse = message;
		}

		return this.lastResponse;
	}

	/**
	 * Adds client prompt or user reply to messages.
	 * @param {Message|Message[]} message - Message to add.
	 * @returns {Message|Message[]}
	 */
	addMessage(message) {
		if (this.handler.storeMessages) {
			if (Array.isArray(message)) {
				for (const msg of message) {
					this.messages.set(msg.id, msg);
				}
			} else {
				this.messages.set(message.id, message);
			}
		}

		return message;
	}

	/**
	 * Changes if the message should be edited.
	 * @param {boolean} state - Change to editable or not.
	 * @returns {CommandUtil}
	 */
	setEditable(state) {
		this.shouldEdit = Boolean(state);
		return this;
	}

	/**
	 * Sends a response or edits an old response if available.
	 * @param {string | APIMessage | MessageOptions | InteractionReplyOptions} options - Options to use.
	 * @returns {Promise<Message|Message[]|void>}
	 */
	// eslint-disable-next-line consistent-return
	async send(options) {
		const hasFiles =
			options.files?.length > 0 || options.embed?.files?.length > 0;

		let newOptions = {};
		if (typeof options === "string") {
			newOptions.content = options;
		} else {
			newOptions = options;
		}
		if (!this.isSlash) {
			delete options.ephemeral;
			if (
				this.shouldEdit &&
				!hasFiles &&
				!this.lastResponse.deleted &&
				!this.lastResponse.attachments.size
			) {
				return this.lastResponse.edit(options);
			}
			const sent = await this.message.channel.send(options);
			const lastSent = this.setLastResponse(sent);
			this.setEditable(!lastSent.attachments.size);
			return sent;
		} else {
			delete options.reply;
			if (
				this.lastResponse ||
				this.message.interaction.deferred ||
				this.message.interaction.replied
			) {
				await this.message.interaction.editReply(options);
				this.lastResponse = await this.message.interaction.fetchReply();
				return this.lastResponse;
			} else {
				this.message.interaction.reply(options);
				if (!options.ephemeral) {
					this.lastResponse = await this.message.interaction.fetchReply();
					return this.lastResponse;
				}
			}
		}
	}

	/**
	 * Sends a response, overwriting the last response.
	 * @param {string | APIMessage | MessageOptions} options - Options to use.
	 * @returns {Promise<Message|Message[]>}
	 */
	async sendNew(options) {
		const sent = await this.message.channel.send(options);
		const lastSent = this.setLastResponse(sent);
		this.setEditable(!lastSent.attachments.size);
		return sent;
	}

	/**
	 * Send an inline reply or respond to a slash command.
	 * @param {string | ReplyMessageOptions | APIMessage | InteractionReplyOptions} options - Options to use.
	 * @returns {Promise<Message|Message[]|void>}
	 */
	reply(options) {
		let newOptions = {};
		if (typeof options == "string") {
			newOptions.content = options;
		} else {
			newOptions = options;
		}

		if (
			!this.isSlash &&
			!this.shouldEdit &&
			!(newOptions instanceof APIMessage) &&
			!this.message.deleted
		) {
			newOptions.reply = {
				messageReference: this.message,
				failIfNotExists: newOptions.failIfNotExists ?? true
			};
		}
		return this.send(newOptions);
	}

	/**
	 * Edits the last response.
	 * @param {string | MessageEditOptions | APIMessage} options - Options to use.
	 * @returns {Promise<Message>}
	 */
	edit(options) {
		if (this.isSlash) {
			return this.lastResponse.editReply(options);
		} else {
			return this.lastResponse.edit(options);
		}
	}

	/**
	 * Deletes the last response.
	 * @returns {Promise<Message | void>}
	 */
	delete() {
		if (this.isSlash) {
			return this.message.deleteReply();
		} else {
			return this.lastResponse?.delete();
		}
	}
}

module.exports = CommandUtil;

/**
 * Extra properties applied to the Discord.js message object.
 * @typedef {Object} MessageExtensions
 * @prop {?CommandUtil} util - Utilities for command responding.
 * Available on all messages after 'all' inhibitors and built-in inhibitors (bot, client).
 * Not all properties of the util are available, depending on the input.
 */
