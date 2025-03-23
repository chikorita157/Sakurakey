/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { defineAsyncComponent } from 'vue';
import type { MenuItem } from '@/types/menu.js';
import * as os from '@/os.js';
import { instance } from '@/instance.js';
import { host } from '@@/js/config.js';
import { i18n } from '@/i18n.js';
import { $i } from '@/account.js';

function toolsMenuItems(): MenuItem[] {
	return [{
		type: 'link',
		to: '/scratchpad',
		text: i18n.ts.scratchpad,
		icon: 'ph-terminal-window ph-bold ph-lg-2',
	}, {
		type: 'link',
		to: '/api-console',
		text: 'API Console',
		icon: 'ph-terminal-window ph-bold ph-lg-2',
	}, {
		type: 'link',
		to: '/clicker',
		text: '🍪👈',
		icon: 'ph-cookie ph-bold ph-lg',
	}, ($i && ($i.isAdmin || $i.policies.canManageCustomEmojis)) ? {
		type: 'link',
		to: '/custom-emojis-manager',
		text: i18n.ts.manageCustomEmojis,
		icon: 'ph-smiley ph-bold ph-lg',
	} : undefined, ($i && ($i.isAdmin || $i.policies.canManageAvatarDecorations)) ? {
		type: 'link',
		to: '/avatar-decorations',
		text: i18n.ts.manageAvatarDecorations,
		icon: 'ph-sparkle ph-bold ph-lg',
	} : undefined];
}

export function openInstanceMenu(ev: MouseEvent) {
	const menuItems: MenuItem[] = [];

	menuItems.push({
		text: instance.name ?? host,
		type: 'label',
	}, {
		type: 'link',
		text: i18n.ts.instanceInfo,
		icon: 'ph-info ph-bold ph-lg',
		to: '/about',
	}, {
		type: 'link',
		text: i18n.ts.customEmojis,
		icon: 'ph-smiley ph-bold ph-lg',
		to: '/about#emojis',
	}, {
		type: 'link',
		text: i18n.ts.federation,
		icon: 'ph-globe-hemisphere-west ph-bold ph-lg',
		to: '/about#federation',
	},{
		text: 'Main Site',
		icon: 'ph-notebook ph-bold ph-lg',
		action: () => {
			window.open('https://joinsakurajima.org', '_blank');
		},
	},{
		text: 'Forums',
		icon: 'ph-newspaper-clipping ph-bold ph-lg',
		action: () => {
			window.open('https://forums.sakurajima.moe', '_blank');
		},
	},{
		type: 'link',
		text: i18n.ts.charts,
		icon: 'ph-chart-line ph-bold ph-lg',
		to: '/about#charts',
	}, ($i && ($i.isAdmin || $i.policies.canInvite) && instance.disableRegistration) ? {
		type: 'link',
		to: '/invite',
		text: i18n.ts.invite,
		icon: 'ph-user-plus ph-bold ph-lg',
	} : undefined, {
		type: 'parent',
		text: i18n.ts.tools,
		icon: 'ph-toolbox ph-bold ph-lg',
		children: toolsMenuItems(),
	}, { type: 'divider' }, {
		type: 'link',
		text: i18n.ts.inquiry,
		icon: 'ph-question ph-bold ph-lg',
		to: '/contact',
	});

	if (instance.impressumUrl) {
		menuItems.push({
			type: 'a',
			text: i18n.ts.impressum,
			icon: 'ti ti-file-invoice',
			href: instance.impressumUrl,
			target: '_blank',
		});
	}

	if (instance.tosUrl) {
		menuItems.push({
			type: 'a',
			text: i18n.ts.termsOfService,
			icon: 'ti ti-notebook',
			href: instance.tosUrl,
			target: '_blank',
		});
	}

	if (instance.privacyPolicyUrl) {
		menuItems.push({
			type: 'a',
			text: i18n.ts.privacyPolicy,
			icon: 'ti ti-shield-lock',
			href: instance.privacyPolicyUrl,
			target: '_blank',
		});
	}

	if (instance.donationUrl) {
		menuItems.push({
			type: 'a',
			text: i18n.ts.donation,
			icon: 'ph-hand-coins ph-bold ph-lg',
			href: instance.donationUrl,
			target: '_blank',
		});
	}

	if (instance.impressumUrl != null || instance.tosUrl != null || instance.privacyPolicyUrl != null || instance.donationUrl != null) {
		menuItems.push({ type: 'divider' });
	}

	menuItems.push({
		type: 'a',
		text: i18n.ts.document,
		icon: 'ti ti-bulb',
		href: 'https://misskey-hub.net/docs/for-users/',
		target: '_blank',
	},{
		text: 'Misskey Guides',
		icon: 'ph-question ph-bold ph-lg',
		action: () => {
			window.open('https://forums.sakurajima.moe/resources/categories/misskey-guides.3/', '_blank');
		},
	}, ($i) ? {
		text: i18n.ts._initialTutorial.launchTutorial,
		icon: 'ph-presentation ph-bold ph-lg',
		action: () => {
			const { dispose } = os.popup(defineAsyncComponent(() => import('@/components/MkTutorialDialog.vue')), {}, {
				closed: () => dispose(),
			});
		},
	} : undefined, {
		type: 'link',
		text: i18n.ts.aboutMisskey,
		icon: 'sk-icons sk-shark sk-icons-lg',
		to: '/about-sharkey',
	});

	os.popupMenu(menuItems, ev.currentTarget ?? ev.target, {
		align: 'left',
	});
}

export function openToolsMenu(ev: MouseEvent) {
	os.popupMenu(toolsMenuItems(), ev.currentTarget ?? ev.target, {
		align: 'left',
	});
}
