// @ts-check
"use strict";

/**
 * @typedef {import("../AkairoClient")} AkairoClient
 * @typedef {import("../AkairoHandler").AkairoHandlerOptions} AkairoHandlerOptions
 * @typedef {import("../AkairoHandler")} EventEmitter
 */

const AkairoError = require("../../util/AkairoError");
const AkairoHandler = require("../AkairoHandler");
const { Collection } = require("discord.js");
// @ts-expect-error
const { isEventEmitter } = require("../../util/Util");
const Listener = require("./Listener");

/**
 * Loads listeners and registers them with EventEmitters.
 * @param {AkairoClient} client - The Akairo client.
 * @param {AkairoHandlerOptions} options - Options.
 * @extends {AkairoHandler}
 */
class ListenerHandler extends AkairoHandler {
	/**
	 * @param {AkairoClient} client - The Akairo client.
	 * @param {AkairoHandlerOptions} options - Options.
	 */
	constructor(
		client,
		{
			directory,
			classToHandle = Listener,
			extensions = [".js", ".ts"],
			automateCategories,
			loadFilter
		} = {}
	) {
		if (
			!(
				classToHandle.prototype instanceof Listener ||
				classToHandle === Listener
			)
		) {
			throw new AkairoError(
				"INVALID_CLASS_TO_HANDLE",
				classToHandle.name,
				Listener.name
			);
		}

		super(client, {
			directory,
			classToHandle,
			extensions,
			automateCategories,
			loadFilter
		});

		/**
		 * EventEmitters for use, mapped by name to EventEmitter.
		 * By default, 'client' is set to the given client.
		 * @type {Collection<string, EventEmitter>}
		 */
		this.emitters = new Collection();
		// @ts-expect-error
		this.emitters.set("client", this.client);

		/**
		 * Directory to listeners.
		 * @name ListenerHandler#directory
		 * @type {string}
		 */

		/**
		 * Listeners loaded, mapped by ID to Listener.
		 * @name ListenerHandler#modules
		 * @type {Collection<string, Listener>}
		 */
	}

	/**
	 * Registers a module.
	 * @param {Listener} listener - Module to use.
	 * @param {string} [filepath] - Filepath of module.
	 * @returns {void}
	 */
	register(listener, filepath) {
		super.register(listener, filepath);
		listener.exec = listener.exec.bind(listener);
		this.addToEmitter(listener.id);
	}

	/**
	 * Deregisters a module.
	 * @param {Listener} listener - Module to use.
	 * @returns {void}
	 */
	deregister(listener) {
		this.removeFromEmitter(listener.id);
		super.deregister(listener);
	}

	/**
	 * Adds a listener to the EventEmitter.
	 * @param {string} id - ID of the listener.
	 * @returns {Listener}
	 */
	addToEmitter(id) {
		/**
		 * @type {Listener}
		 */
		// @ts-expect-error
		const listener = this.modules.get(id.toString());
		if (!listener)
			throw new AkairoError("MODULE_NOT_FOUND", this.classToHandle.name, id);

		/**
		 * @type {AkairoHandler}
		 */
		// @ts-expect-error
		const emitter = isEventEmitter(listener.emitter)
			? listener.emitter
			: // @ts-expect-error
			  this.emitters.get(listener.emitter);
		if (!isEventEmitter(emitter))
			throw new AkairoError("INVALID_TYPE", "emitter", "EventEmitter", true);

		if (listener.type === "once") {
			emitter.once(listener.event, listener.exec);
			return listener;
		}

		emitter.on(listener.event, listener.exec);
		return listener;
	}

	/**
	 * Removes a listener from the EventEmitter.
	 * @param {string} id - ID of the listener.
	 * @returns {Listener}
	 */
	removeFromEmitter(id) {
		/**
		 * @type {Listener}
		 */
		// @ts-expect-error
		const listener = this.modules.get(id.toString());
		if (!listener)
			throw new AkairoError("MODULE_NOT_FOUND", this.classToHandle.name, id);

		/**
		 * @type {AkairoHandler}
		 */
		// @ts-expect-error
		const emitter = isEventEmitter(listener.emitter)
			? listener.emitter
			: // @ts-expect-error
			  this.emitters.get(listener.emitter);
		if (!isEventEmitter(emitter))
			throw new AkairoError("INVALID_TYPE", "emitter", "EventEmitter", true);

		emitter.removeListener(listener.event, listener.exec);
		return listener;
	}

	/**
	 * Sets custom emitters.
	 * @param {Object} emitters - Emitters to use.
	 * The key is the name and value is the emitter.
	 * @returns {ListenerHandler}
	 */
	setEmitters(emitters) {
		for (const [key, value] of Object.entries(emitters)) {
			if (!isEventEmitter(value))
				throw new AkairoError("INVALID_TYPE", key, "EventEmitter", true);
			this.emitters.set(key, value);
		}

		return this;
	}

	/**
	 * Loads a listener.
	 * @method
	 * @name ListenerHandler#load
	 * @param {string|Listener} thing - Module or path to module.
	 * @returns {Listener}
	 */

	/**
	 * Reads all listeners from the directory and loads them.
	 * @method
	 * @name ListenerHandler#loadAll
	 * @param {string} [directory] - Directory to load from.
	 * Defaults to the directory passed in the constructor.
	 * @param {LoadPredicate} [filter] - Filter for files, where true means it should be loaded.
	 * @returns {ListenerHandler}
	 */

	/**
	 * Removes a listener.
	 * @method
	 * @name ListenerHandler#remove
	 * @param {string} id - ID of the listener.
	 * @returns {Listener}
	 */

	/**
	 * Removes all listeners.
	 * @method
	 * @name ListenerHandler#removeAll
	 * @returns {ListenerHandler}
	 */

	/**
	 * Reloads a listener.
	 * @method
	 * @name ListenerHandler#reload
	 * @param {string} id - ID of the listener.
	 * @returns {Listener}
	 */

	/**
	 * Reloads all listeners.
	 * @method
	 * @name ListenerHandler#reloadAll
	 * @returns {ListenerHandler}
	 */
}

module.exports = ListenerHandler;

/**
 * Emitted when a listener is loaded.
 * @event ListenerHandler#load
 * @param {Listener} listener - Listener loaded.
 * @param {boolean} isReload - Whether or not this was a reload.
 */

/**
 * Emitted when a listener is removed.
 * @event ListenerHandler#remove
 * @param {Listener} listener - Listener removed.
 */
