import Typesense from 'typesense';

const typesenseApiKey = process.env.TYPESENSE_API_KEY;
const host = process.env.TYPESENSE_HOST || 'localhost';
const port = parseInt(process.env.TYPESENSE_PORT || '8108', 10);
const protocol = process.env.TYPESENSE_PROTOCOL || 'http';

export const isTypesenseEnabled = Boolean(typesenseApiKey);

export const typesenseClient = isTypesenseEnabled
  ? new Typesense.Client({
      nodes: [
        {
          host,
          port,
          protocol,
        },
      ],
      apiKey: typesenseApiKey,
      connectionTimeoutSeconds: 2,
    })
  : null;

// Schemas for the indexable collections
export const COLLECTIONS = {
  EVENTS: {
    name: 'events',
    fields: [
      { name: 'id', type: 'string' },
      { name: 'name', type: 'string' },
      { name: 'description', type: 'string' },
      { name: 'shortName', type: 'string', optional: true },
      { name: 'location', type: 'string', optional: true },
      { name: 'tags', type: 'string[]', facet: true },
      { name: 'category', type: 'string', facet: true, optional: true },
      { name: 'date', type: 'string', optional: true },
    ],
    default_sorting_field: 'name',
  },
  MEMBERS: {
    name: 'members',
    fields: [
      { name: 'id', type: 'string' },
      { name: 'name', type: 'string' },
      { name: 'role', type: 'string', optional: true },
      { name: 'bio', type: 'string', optional: true },
      { name: 'skills', type: 'string[]', facet: true },
    ],
    default_sorting_field: 'name',
  },
  ACTIVITIES: {
    name: 'activities',
    fields: [
      { name: 'id', type: 'string' },
      { name: 'title', type: 'string' },
      { name: 'description', type: 'string', optional: true },
      { name: 'subtitle', type: 'string', optional: true },
      { name: 'tags', type: 'string[]', facet: true, optional: true },
    ],
    default_sorting_field: 'title',
  },
};

/**
 * Initialize Typesense collections if enabled and they do not exist
 */
export async function initializeTypesenseCollections() {
  if (!isTypesenseEnabled) return;

  for (const collectionSchema of Object.values(COLLECTIONS)) {
    try {
      await typesenseClient.collections(collectionSchema.name).retrieve();
    } catch (error) {
      if (error.status === 404) {
        try {
          await typesenseClient.collections().create(collectionSchema);
        } catch (createErr) {
          console.error(`Failed to create collection ${collectionSchema.name}:`, createErr);
        }
      } else {
        console.error(`Error checking collection ${collectionSchema.name}:`, error);
      }
    }
  }
}
