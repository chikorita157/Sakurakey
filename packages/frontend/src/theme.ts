/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ref } from 'vue';
import tinycolor from 'tinycolor2';
import lightTheme from '@@/themes/_light.json5';
import darkTheme from '@@/themes/_dark.json5';
import JSON5 from 'json5';
import type { Ref } from 'vue';
import type { BundledTheme } from 'shiki/themes';
import { deepClone } from '@/utility/clone.js';
import { globalEvents } from '@/events.js';
import { miLocalStorage } from '@/local-storage.js';
import { $i } from '@/i.js';
import { prefer } from '@/preferences.js';

export type Theme = {
	id: string;
	name: string;
	author: string;
	desc?: string;
	base?: 'dark' | 'light';
	props: Record<string, string>;
	codeHighlighter?: {
		base: BundledTheme;
		overrides?: Record<string, any>;
	} | {
		base: '_none_';
		overrides: Record<string, any>;
	};
};

export const themeProps = Object.keys(lightTheme.props).filter(key => !key.startsWith('X'));

export const getBuiltinThemes = () => Promise.all(
	[
		'l-light',
		'l-coffee',
		'l-apricot',
		'l-rainy',
		'l-botanical',
		'l-vivid',
		'l-cherry',
		'l-sushi',
		'l-u0',
		'l-rosepinedawn',
		'l-sakura',
		'l-sakurajima-sakura',
		'l-gekka',
		'l-holiday',
		'l-catppuccin-frappe-blue',
		'l-catppuccin-frappe-flamingo',
		'l-catppuccin-frappe-green',
		'l-catppuccin-frappe-lavender',
		'l-catppuccin-frappe-maroon',
		'l-catppuccin-frappe-mauve',
		'l-catppuccin-frappe-peach',
		'l-catppuccin-frappe-pink',
		'l-catppuccin-frappe-red',
		'l-catppuccin-frappe-rosewater',
		'l-catppuccin-frappe-sapphire',
		'l-catppuccin-frappe-sky',
		'l-catppuccin-frappe-teal',
		'l-catppuccin-frappe-yellow',

		'd-dark',
		'd-persimmon',
		'd-astro',
		'd-future',
		'd-botanical',
		'd-green-lime',
		'd-green-orange',
		'd-cherry',
		'd-ice',
		'd-u0',
		'd-rosepine',
		'd-rosepinemoon',
		'd-yozakura',
		'd-catppuccin-latte-blue',
		'd-catppuccin-latte-flamingo',
		'd-catppuccin-latte-green',
		'd-catppuccin-latte-lavender',
		'd-catppuccin-latte-maroon',
		'd-catppuccin-latte-mauve',
		'd-catppuccin-latte-peach',
		'd-catppuccin-latte-pink',
		'd-catppuccin-latte-red',
		'd-catppuccin-latte-rosewater',
		'd-catppuccin-latte-sapphire',
		'd-catppuccin-latte-sky',
		'd-catppuccin-latte-teal',
		'd-catppuccin-latte-yellow',
		'd-catppuccin-macchiato-blue',
		'd-catppuccin-macchiato-flamingo',
		'd-catppuccin-macchiato-green',
		'd-catppuccin-macchiato-lavender',
		'd-catppuccin-macchiato-maroon',
		'd-catppuccin-macchiato-mauve',
		'd-catppuccin-macchiato-peach',
		'd-catppuccin-macchiato-pink',
		'd-catppuccin-macchiato-red',
		'd-catppuccin-macchiato-rosewater',
		'd-catppuccin-macchiato-sapphire',
		'd-catppuccin-macchiato-sky',
		'd-catppuccin-macchiato-teal',
		'd-catppuccin-macchiato-yellow',
		'd-catppuccin-mocha-blue',
		'd-catppuccin-mocha-flamingo',
		'd-catppuccin-mocha-green',
		'd-catppuccin-mocha-lavender',
		'd-catppuccin-mocha-maroon',
		'd-catppuccin-mocha-mauve',
		'd-catppuccin-mocha-peach',
		'd-catppuccin-mocha-pink',
		'd-catppuccin-mocha-red',
		'd-catppuccin-mocha-rosewater',
		'd-catppuccin-mocha-sapphire',
		'd-catppuccin-mocha-sky',
		'd-catppuccin-mocha-teal',
		'd-catppuccin-mocha-yellow'
	].map(name => import(`@/themes/${name}.json5`).then(({ default: _default }): Theme => _default)),
);

export function getBuiltinThemesRef() {
	const builtinThemes = ref<Theme[]>([]);
	getBuiltinThemes().then(themes => builtinThemes.value = themes);
	return builtinThemes;
}

export function getThemesRef(): Ref<Theme[]> {
	return prefer.r.themes;
}

export async function addTheme(theme: Theme): Promise<void> {
	if ($i == null) return;
	const builtinThemes = await getBuiltinThemes();
	if (builtinThemes.some(t => t.id === theme.id)) {
		throw new Error('builtin theme');
	}
	const themes = prefer.s.themes;
	if (themes.some(t => t.id === theme.id)) {
		throw new Error('already exists');
	}
	prefer.commit('themes', [...themes, theme]);
}

export async function removeTheme(theme: Theme): Promise<void> {
	if ($i == null) return;
	const themes = prefer.s.themes.filter(t => t.id !== theme.id);
	prefer.commit('themes', themes);
}

const themeFontFaceName = 'sharkey-theme-font-face';

let timeout: number | null = null;

export function applyTheme(theme: Theme, persist = true) {
	if (timeout) window.clearTimeout(timeout);

	window.document.documentElement.classList.add('_themeChanging_');

	timeout = window.setTimeout(() => {
		window.document.documentElement.classList.remove('_themeChanging_');

		// 色計算など再度行えるようにクライアント全体に通知
		globalEvents.emit('themeChanged');
	}, 1000);

	const colorScheme = theme.base === 'dark' ? 'dark' : 'light';

	window.document.documentElement.dataset.colorScheme = colorScheme;

	// Deep copy
	const _theme = deepClone(theme);

	if (_theme.base) {
		const base = [lightTheme, darkTheme].find(x => x.id === _theme.base);
		if (base) _theme.props = Object.assign({}, base.props, _theme.props);
	}

	const props = compile(_theme);

	for (const tag of window.document.head.children) {
		if (tag.tagName === 'META' && tag.getAttribute('name') === 'theme-color') {
			tag.setAttribute('content', props['htmlThemeColor']);
			break;
		}
	}

	let existingFontFace;
	window.document.fonts.forEach(
		(fontFace) => {
			if (fontFace.family === themeFontFaceName) existingFontFace = fontFace;
		},
	);
	if (existingFontFace) window.document.fonts.delete(existingFontFace);

	const fontFaceSrc = props.fontFaceSrc;
	const fontFaceOpts = props.fontFaceOpts || {};

	if (fontFaceSrc) {
		const fontFace = new FontFace(
			themeFontFaceName,
			fontFaceSrc, fontFaceOpts,
		);
		window.document.fonts.add(fontFace);
		fontFace.load().catch(
			(failure) => {
				console.log(failure);
			},
		);
	}

	for (const [k, v] of Object.entries(props)) {
		if (k.startsWith('font')) continue;
		window.document.documentElement.style.setProperty(`--MI_THEME-${k}`, v.toString());
	}

	window.document.documentElement.style.setProperty('color-scheme', colorScheme);

	if (persist) {
		miLocalStorage.setItem('theme', JSON.stringify(props));
		miLocalStorage.setItem('themeId', theme.id);
		miLocalStorage.setItem('colorScheme', colorScheme);
	}

	// 色計算など再度行えるようにクライアント全体に通知
	globalEvents.emit('themeChanging');
}

export function compile(theme: Theme): Record<string, string> {
	function getColor(val: string): tinycolor.Instance {
		if (val[0] === '@') { // ref (prop)
			return getColor(theme.props[val.substring(1)]);
		} else if (val[0] === '$') { // ref (const)
			return getColor(theme.props[val]);
		} else if (val[0] === ':') { // func
			const parts = val.split('<');
			const func = parts.shift().substring(1);
			const arg = parseFloat(parts.shift());
			const color = getColor(parts.join('<'));

			switch (func) {
				case 'darken': return color.darken(arg);
				case 'lighten': return color.lighten(arg);
				case 'alpha': return color.setAlpha(arg);
				case 'hue': return color.spin(arg);
				case 'saturate': return color.saturate(arg);
			}
		}

		// other case
		return tinycolor(val);
	}

	const props = {};

	for (const [k, v] of Object.entries(theme.props)) {
		if (k.startsWith('$')) continue; // ignore const
		if (k.startsWith('font')) { // font specs are different
			props[k] = v;
			continue;
		}

		props[k] = v.startsWith('"') ? v.replace(/^"\s*/, '') : genValue(getColor(v));
	}

	return props;
}

function genValue(c: tinycolor.Instance): string {
	return c.toRgbString();
}

export function validateTheme(theme: Record<string, any>): boolean {
	if (theme.id == null || typeof theme.id !== 'string') return false;
	if (theme.name == null || typeof theme.name !== 'string') return false;
	if (theme.base == null || !['light', 'dark'].includes(theme.base)) return false;
	if (theme.props == null || typeof theme.props !== 'object') return false;
	return true;
}

export function parseThemeCode(code: string): Theme {
	let theme;

	try {
		theme = JSON5.parse(code);
	} catch (err) {
		throw new Error('Failed to parse theme json');
	}
	if (!validateTheme(theme)) {
		throw new Error('This theme is invaild');
	}
	if (prefer.s.themes.some(t => t.id === theme.id)) {
		throw new Error('This theme is already installed');
	}

	return theme;
}

export function previewTheme(code: string): void {
	const theme = parseThemeCode(code);
	if (theme) applyTheme(theme, false);
}

export async function installTheme(code: string): Promise<void> {
	const theme = parseThemeCode(code);
	if (!theme) return;
	await addTheme(theme);
}
