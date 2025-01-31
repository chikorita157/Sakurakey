/*
 * SPDX-FileCopyrightText: marie and other Sharkey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { parseTimelineArgs, TimelineArgs } from '@/server/api/mastodon/timelineArgs.js';
import { convertNotification } from '../converters.js';
import type { MegalodonInterface } from 'megalodon';
import type { FastifyRequest } from 'fastify';

export interface ApiNotifyMastodonRoute {
	Params: {
		id?: string,
	},
	Querystring: TimelineArgs,
}

export class ApiNotifyMastodon {
	constructor(
		private readonly request: FastifyRequest<ApiNotifyMastodonRoute>,
		private readonly client: MegalodonInterface,
	) {}

	public async getNotifications() {
		const data = await this.client.getNotifications(parseTimelineArgs(this.request.query));
		return data.data.map(n => {
			const converted = convertNotification(n);
			if (converted.type === 'reaction') {
				converted.type = 'favourite';
			}
			return converted;
		});
	}

	public async getNotification() {
		if (!this.request.params.id) throw new Error('Missing required parameter "id"');
		const data = await this.client.getNotification(this.request.params.id);
		const converted = convertNotification(data.data);
		if (converted.type === 'reaction') {
			converted.type = 'favourite';
		}
		return converted;
	}

	public async rmNotification() {
		if (!this.request.params.id) throw new Error('Missing required parameter "id"');
		const data = await this.client.dismissNotification(this.request.params.id);
		return data.data;
	}

	public async rmNotifications() {
		const data = await this.client.dismissNotifications();
		return data.data;
	}
}
