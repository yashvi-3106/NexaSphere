import { withDb } from './db.js';

function parsePostgresArray(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const content = trimmed.slice(1, -1).trim();
      return content ? content.split(',').map(item => item.trim().replace(/^"|"$/g, '')) : [];
    }
  }
  return [];
}

function mapRow(row) {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    date: row.date_text,
    description: row.description,
    status: row.status,
    icon: row.icon,
    tags: parsePostgresArray(row.tags),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const eventsRepository = {
  // Returns { rows, total } — rows are the current page, total is the full
  // count without LIMIT so callers can build pagination metadata.
  async list({ page = 1, limit = 20 } = {}) {
    return withDb(async (client) => {
      const offset = (page - 1) * limit;
      const { rows } = await client.query(
        `select *, count(*) over()::int as total 
         from events 
         order by created_at desc 
         limit $1 offset $2`,
        [limit, offset],
      );
      
      const total = rows.length > 0 ? rows[0].total : 0;
      return { rows: rows.map(mapRow), total };
    });
  },

  async create(event) {
    return withDb(async (client) => {
      const { rows } = await client.query(
        `insert into events (id, name, short_name, date_text, description, status, icon, tags)
         values ($1,$2,$3,$4,$5,$6,$7,$8)
         on conflict (id) do update set
           name=excluded.name,
           short_name=excluded.short_name,
           date_text=excluded.date_text,
           description=excluded.description,
           status=excluded.status,
           icon=excluded.icon,
           tags=excluded.tags,
           updated_at=now()
         returning *`,
        [event.id, event.name, event.shortName, event.date, event.description, event.status, event.icon, event.tags]
      );
      return mapRow(rows[0]);
    });
  },

  async update(id, patch) {
    return withDb(async (client) => {
      const keys = Object.keys(patch);
      
      // If the patch payload is empty, skip the DB call and just return the current record
      if (keys.length === 0) {
        const { rows } = await client.query('select * from events where id = $1', [id]);
        return rows.length ? mapRow(rows[0]) : null;
      }

      // Map JavaScript camelCase properties back to database snake_case columns
      const fieldMap = {
        name: 'name',
        shortName: 'short_name',
        date: 'date_text',
        description: 'description',
        status: 'status',
        icon: 'icon',
        tags: 'tags'
      };

      const setClauses = [];
      const values = [id]; // $1 is always the ID for the WHERE clause
      let paramIndex = 2;   // Dynamic parameters start at $2

      for (const key of keys) {
        if (fieldMap[key] !== undefined) {
          setClauses.push(`${fieldMap[key]} = $${paramIndex}`);
          
          // Ensure arrays are passed in a format pg-driver handles natively or as clean nulls
          let val = patch[key];
          if (key === 'tags' && Array.isArray(val)) {
            // Converts JS array directly to PG array format if driver needs it, 
            // or lets the driver serialize it safely.
            val = val; 
          }
          
          values.push(val);
          paramIndex++;
        }
      }

      // Always append the updated timestamp
      setClauses.push(`updated_at = now()`);

      const queryText = `
        update events 
        set ${setClauses.join(', ')} 
        where id = $1 
        returning *`;

      const { rows } = await client.query(queryText, values);
      if (!rows.length) return null;
      
      return mapRow(rows[0]);
    });
  },

  async delete(id) {
    return withDb(async (client) => {
      const { rowCount } = await client.query('delete from events where id=$1', [id]);
      return rowCount > 0;
    });
  },
};
