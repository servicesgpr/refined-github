import {h} from 'dom-chef';
import select from 'select-dom';
import elementReady from 'element-ready';
import domLoaded from 'dom-loaded';

/**
 * Prevent fn's errors from blocking the remaining tasks.
 * https://github.com/sindresorhus/refined-github/issues/678
 * The code looks weird but it's synchronous and fn is called without args.
 */
export const safely = async fn => fn();

export const getUsername = () => select('meta[name="user-login"]').getAttribute('content');

export const groupBy = (iterable, grouper) => {
	const map = {};
	for (const item of iterable) {
		const key = grouper(item);
		map[key] = map[key] || [];
		map[key].push(item);
	}
	return map;
};

/**
 * Automatically stops checking for an element to appear once the DOM is ready.
 */
export const safeElementReady = selector => {
	const waiting = elementReady(selector);

	// Don't check ad-infinitum
	domLoaded.then(() => requestAnimationFrame(() => waiting.cancel()));

	// If cancelled, return null like a regular select() would
	return waiting.catch(() => null);
};

/**
 * Append to an element, but before a element that might not exist.
 * @param  {Element|string} parent  Element (or its selector) to which append the `child`
 * @param  {string}         before  Selector of the element that `child` should be inserted before
 * @param  {Element}        child   Element to append
 * @example
 *
 * <parent>
 *   <yes/>
 *   <oui/>
 *   <nope/>
 * </parent>
 *
 * appendBefore('parent', 'nope', <sì/>);
 *
 * <parent>
 *   <yes/>
 *   <oui/>
 *   <sì/>
 *   <nope/>
 * </parent>
 */
export const appendBefore = (parent, before, child) => {
	if (typeof parent === 'string') {
		parent = select(parent);
	}

	// Select direct children only
	before = select(`:scope > ${before}`, parent);
	if (before) {
		before.before(child);
	} else {
		parent.append(child);
	}
};

export const observeEl = (el, listener, options = {childList: true}) => {
	if (typeof el === 'string') {
		el = select(el);
	}

	if (!el) {
		return;
	}

	// Run first
	listener([]);

	// Run on updates
	const observer = new MutationObserver(listener);
	observer.observe(el, options);
	return observer;
};

// Concats arrays but does so like a zipper instead of appending them
// [[0, 1, 2], [0, 1]] => [0, 0, 1, 1, 2]
// Like lodash.zip
export const flatZip = (table, limit = Infinity) => {
	const maxColumns = Math.max(...table.map(row => row.length));
	const zipped = [];
	for (let col = 0; col < maxColumns; col++) {
		for (const row of table) {
			if (row[col]) {
				zipped.push(row[col]);
				if (zipped.length === limit) {
					return zipped;
				}
			}
		}
	}
	return zipped;
};

export const isMac = /Mac/.test(window.navigator.platform);

export const metaKey = isMac ? 'metaKey' : 'ctrlKey';

export const groupButtons = buttons => {
	// Ensure every button has this class
	$(buttons).addClass('BtnGroup-item');

	// They may already be part of a group
	let group = buttons[0].closest('.BtnGroup');

	// If it doesn't exist, wrap them in a new group
	if (!group) {
		group = <div class="BtnGroup"></div>;
		$(buttons).wrapAll(group);
	}

	return group;
};
