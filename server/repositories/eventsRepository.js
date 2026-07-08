import { withDb } from './db.js';

function mapRow(row) {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    date: row.date_text,
    description: row.description,
    status: row.status,
    icon: row.icon,
    tags: Array.isArray(row.tags) ? row.tags : (row.tags ?? []),
    restrictedGroups:
      typeof row.restricted_groups === 'string'
        ? JSON.parse(row.restricted_groups)
        : (row.restricted_groups ?? []),
    seriesId: row.series_id,
    recurrencePattern: row.recurrence_pattern,
    recurrenceEndDate: row.recurrence_end_date,
    occurrenceIndex: row.occurrence_index,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
export const eventsRepository = {
  async list({
    page = 1,
    limit = 20,
    status,
    studentGroups = undefined,
    startDate,
    endDate,
    category,
    location,
    search,
  } = {}) {
    return withDb(async (client) => {
      await client.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ');

      try {
        const offset = (page - 1) * limit;

        let query = 'select * from events ';
        const params = [];
        let conditions = [];

        if (status) {
          conditions.push(`status = $${params.length + 1}`);
          params.push(status);
        }

        if (category) {
          conditions.push(`LOWER(array_to_string(tags, ',')) LIKE LOWER($${params.length + 1})`);
          params.push(`%${category}%`);
        }

        if (location) {
          conditions.push(`LOWER(description) LIKE LOWER($${params.length + 1})`);
          params.push(`%${location}%`);
        }

        if (search) {
          conditions.push(
            `(LOWER(name) LIKE LOWER($${params.length + 1})
      OR LOWER(description) LIKE LOWER($${params.length + 2}))`
          );

          params.push(`%${search}%`);
          params.push(`%${search}%`);
        }

        if (startDate) {
          conditions.push(`date_text >= $${params.length + 1}`);
          params.push(startDate);
        }

        if (endDate) {
          conditions.push(`date_text <= $${params.length + 1}`);
          params.push(endDate);
        }

        if (studentGroups === undefined) {
          // If no groups provided, only show public events
          conditions.push(
            `(restricted_groups IS NULL OR jsonb_array_length(restricted_groups) = 0 OR restricted_groups = '[]'::jsonb)`
          );
        } else {
          // Show public events OR events where restricted_groups overlaps with studentGroups
          const groupArray = studentGroups.length
            ? studentGroups.map((id) => `'${id}'`).join(',')
            : "'-1'"; // -1 to match nothing
          conditions.push(
            `(restricted_groups IS NULL OR jsonb_array_length(restricted_groups) = 0 OR restricted_groups = '[]'::jsonb OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(restricted_groups) AS g WHERE g IN (${groupArray})))`
          );
        }

        if (conditions.length > 0) {
          query += ' where ' + conditions.join(' and ');
        }

        query += ` order by created_at desc limit $1 offset $2`;
        params.push(limit, offset);

        const { rows } = await client.query(query, params);

        const countQuery =
          'select count(*)::int as total from events ' +
          (conditions.length > 0 ? ' where ' + conditions.join(' and ') : '');
        const countResult = await client.query(countQuery);

        const total = countResult.rows[0]?.total ?? 0;

        await client.query('COMMIT');

        return {
          rows: rows.map(mapRow),
          total,
        };
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      }
    });
  },

  async getById(id) {
    return withDb(async (client) => {
      const { rows } = await client.query('select * from events where id = $1', [id]);
      if (!rows.length) return null;
      return mapRow(rows[0]);
    });
  },

  async create(event) {
    return withDb(async (client) => {
      const { rows } = await client.query(
        `insert into events (id, name, short_name, date_text, description, status, icon, tags, restricted_groups, series_id, recurrence_pattern, recurrence_end_date, occurrence_index)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         on conflict (id) do update set
           name=excluded.name,
           short_name=excluded.short_name,
           date_text=excluded.date_text,
           description=excluded.description,
           status=excluded.status,
           icon=excluded.icon,
           tags=excluded.tags,
           restricted_groups=excluded.restricted_groups,
           series_id=excluded.series_id,
           recurrence_pattern=excluded.recurrence_pattern,
           recurrence_end_date=excluded.recurrence_end_date,
           occurrence_index=excluded.occurrence_index,
           updated_at=now()
         returning *`,
        [
          event.id,
          event.name,
          event.shortName,
          event.date,
          event.description,
          event.status,
          event.icon,
          event.tags,
          JSON.stringify(event.restrictedGroups || []),
          event.seriesId || null,
          event.recurrencePattern || null,
          event.recurrenceEndDate || null,
          event.occurrenceIndex || null,
        ]
      );
      const mapped = mapRow(rows[0]);
      import('../services/searchIndexer.js')
        .then(({ searchIndexer }) => searchIndexer.indexEvent(mapped))
        .catch(() => {});
      return mapped;
    });
  },

  async update(id, patch) {
    return withDb(async (client) => {
      const { rows } = await client.query(
        `update events set
           name = coalesce($2, name),
           short_name = coalesce($3, short_name),
           date_text = coalesce($4, date_text),
           description = coalesce($5, description),
           status = coalesce($6, status),
           icon = coalesce($7, icon),
           tags = coalesce($8, tags),
           restricted_groups = coalesce($9, restricted_groups),
           series_id = coalesce($10, series_id),
           recurrence_pattern = coalesce($11, recurrence_pattern),
           recurrence_end_date = coalesce($12, recurrence_end_date),
           occurrence_index = coalesce($13, occurrence_index),
           updated_at = now()
         where id = $1
         returning *`,
        [
          id,
          patch.name ?? null,
          patch.shortName ?? null,
          patch.date ?? null,
          patch.description ?? null,
          patch.status ?? null,
          patch.icon ?? null,
          patch.tags ?? null,
          patch.restrictedGroups ? JSON.stringify(patch.restrictedGroups) : null,
          patch.seriesId ?? null,
          patch.recurrencePattern ?? null,
          patch.recurrenceEndDate ?? null,
          patch.occurrenceIndex ?? null,
        ]
      );
      if (!rows.length) return null;
      const mapped = mapRow(rows[0]);
      import('../services/searchIndexer.js')
        .then(({ searchIndexer }) => searchIndexer.indexEvent(mapped))
        .catch(() => {});
      return mapped;
    });
  },

  async delete(id) {
    return withDb(async (client) => {
      const { rowCount } = await client.query('delete from events where id=$1', [id]);
      if (rowCount > 0) {
        import('../services/searchIndexer.js')
          .then(({ searchIndexer }) => searchIndexer.deleteDocument('events', id))
          .catch(() => {});
      }
      return rowCount > 0;
    });
  },

  async deleteSeries(seriesId) {
    return withDb(async (client) => {
      const { rowCount } = await client.query('delete from events where series_id=$1', [seriesId]);
      return rowCount > 0;
    });
  },

  async updateSeries(seriesId, patch) {
    return withDb(async (client) => {
      const { rows } = await client.query(
        `update events set
           name = coalesce($2, name),
           short_name = coalesce($3, short_name),
           description = coalesce($4, description),
           status = coalesce($5, status),
           icon = coalesce($6, icon),
           tags = coalesce($7, tags),
           restricted_groups = coalesce($8, restricted_groups),
           updated_at = now()
         where series_id = $1
         returning *`,
        [
          seriesId,
          patch.name ?? null,
          patch.shortName ?? null,
          patch.description ?? null,
          patch.status ?? null,
          patch.icon ?? null,
          patch.tags ?? null,
          patch.restrictedGroups ? JSON.stringify(patch.restrictedGroups) : null,
        ]
      );
      if (!rows.length) return null;
      return rows.map(mapRow);
    });
  },
  async listAll({
    page = 1,
    limit = 20,
    status,
    startDate,
    endDate,
    category,
    location,
    search,
  } = {}) {
    return withDb(async (client) => {
      const offset = (page - 1) * limit;

      let query = 'select * from events';
      const params = [];
      const conditions = [];

      if (status) {
        conditions.push(`status = $${params.length + 1}`);
        params.push(status);
      }

      if (category) {
        conditions.push(`LOWER(array_to_string(tags, ',')) LIKE LOWER($${params.length + 1})`);
        params.push(`%${category}%`);
      }

      if (location) {
        conditions.push(`LOWER(description) LIKE LOWER($${params.length + 1})`);
        params.push(`%${location}%`);
      }

      if (search) {
        conditions.push(
          `(LOWER(name) LIKE LOWER($${params.length + 1})
        OR LOWER(description) LIKE LOWER($${params.length + 2}))`
        );

        params.push(`%${search}%`);
        params.push(`%${search}%`);
      }

      if (startDate) {
        conditions.push(`date_text >= $${params.length + 1}`);
        params.push(startDate);
      }

      if (endDate) {
        conditions.push(`date_text <= $${params.length + 1}`);
        params.push(endDate);
      }

      if (conditions.length) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;

      params.push(limit, offset);

      const { rows } = await client.query(query, params);

      let countQuery = 'select count(*)::int as total from events';

      if (conditions.length) {
        countQuery += ' WHERE ' + conditions.join(' AND ');
      }

      const countResult = await client.query(countQuery, params.slice(0, params.length - 2));

      return {
        rows: rows.map(mapRow),
        total: countResult.rows[0]?.total ?? 0,
      };
    });
  },
};
