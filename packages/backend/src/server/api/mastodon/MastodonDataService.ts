/*
 * SPDX-FileCopyrightText: hazelnoot and other Sharkey contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Inject, Injectable } from '@nestjs/common';
import { DI } from '@/di-symbols.js';
import { QueryService } from '@/core/QueryService.js';
import type { MiNote, NotesRepository } from '@/models/_.js';
import type { MiLocalUser } from '@/models/User.js';

/**
 * Utility service for accessing data with Mastodon semantics
 */
@Injectable()
export class MastodonDataService {
	constructor(
		@Inject(DI.notesRepository)
		private readonly notesRepository: NotesRepository,

		@Inject(QueryService)
		private readonly queryService: QueryService,
	) {}

	public async getNote(noteId: string, me?: MiLocalUser | null): Promise<MiNote | null> {
		// Root query: note + required dependencies
		const query = this.notesRepository
			.createQueryBuilder('note')
			.where('note.id = :noteId', { noteId })
			.innerJoinAndSelect('note.user', 'user');

		// Restrict visibility
		this.queryService.generateVisibilityQuery(query, me);
		if (me) {
			this.queryService.generateBlockedUserQuery(query, me);
		}

		return await query.getOne();
	}
}
