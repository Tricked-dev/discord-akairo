// @ts-check
"use strict";

/**
 * Akairo Utilities.
 */
class Util {
	/**
	 * Checks if a value is a promise.
	 * @param {any} value - Value to check.
	 * @returns {boolean}
	 */
	static isPromise(value) {
		return (
			value &&
			typeof value.then === "function" &&
			typeof value.catch === "function"
		);
	}

	/**
	 * Checks if the supplied value is a promise.
	 * @param {any} value - Value to check.
	 * @returns {boolean}
	 */
	static isEventEmitter(value) {
		return (
			value &&
			typeof value.on === "function" &&
			typeof value.emit === "function"
		);
	}

	/**
	 * Compares two prefixes.
	 * @param {any} aKey - First prefix.
	 * @param {any} bKey - Second prefix.
	 * @returns {number}
	 */
	static prefixCompare(aKey, bKey) {
		if (aKey === "" && bKey === "") return 0;
		if (aKey === "") return 1;
		if (bKey === "") return -1;
		if (typeof aKey === "function" && typeof bKey === "function") return 0;
		if (typeof aKey === "function") return 1;
		if (typeof bKey === "function") return -1;
		return aKey.length === bKey.length
			? aKey.localeCompare(bKey)
			: bKey.length - aKey.length;
	}

	/**
	 * Converts the supplied value into an array if it is not already one.
	 * @param {any} x - Value to convert.
	 * @returns {any}
	 */
	static intoArray(x) {
		if (Array.isArray(x)) {
			return x;
		}

		return [x];
	}

	/**
	 * Converts something to become callable.
	 * @param {any} thing - What to turn into a callable.
	 * @returns {any}
	 */
	static intoCallable(thing) {
		if (typeof thing === "function") {
			return thing;
		}

		return () => thing;
	}

	/**
	 *
	 * @param {any} xs -
	 * @param {any} f -
	 * @returns {any}
	 */
	static flatMap(xs, f) {
		const res = [];
		for (const x of xs) {
			res.push(...f(x));
		}

		return res;
	}

	/**
	 *
	 * @param {any} o1 -
	 * @param {any} os -
	 * @returns {any}
	 */
	static deepAssign(o1, ...os) {
		for (const o of os) {
			for (const [k, v] of Object.entries(o)) {
				const vIsObject = v && typeof v === "object";
				const o1kIsObject =
					Object.prototype.hasOwnProperty.call(o1, k) &&
					o1[k] &&
					typeof o1[k] === "object";
				if (vIsObject && o1kIsObject) {
					Util.deepAssign(o1[k], v);
				} else {
					o1[k] = v;
				}
			}
		}

		return o1;
	}

	/**
	 *
	 * @param {any[]} xs -
	 * @returns {any}
	 */
	static choice(...xs) {
		for (const x of xs) {
			if (x != null) {
				return x;
			}
		}

		return null;
	}
}

module.exports = Util;
