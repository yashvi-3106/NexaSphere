// server/swagger.js
// Swagger/OpenAPI configuration for NexaSphere API
// Accessible at /api-docs when server is running

import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'NexaSphere API',
      version: '1.0.0',
      description:
        'REST API for NexaSphere — the official tech community platform for GL Bajaj Group of Institutions. ' +
        'Manages events, core team members, form submissions, and admin operations.',
      contact: {
        name: 'NexaSphere Core Team',
        email: 'nexasphere@glbajajgroup.org',
        url: 'https://nexasphere-glbajaj.vercel.app',
      },
    },
    servers: [
      {
        url: 'http://localhost:8787',
        description: 'Local development server',
      },
      {
        url: 'https://nexasphere-api.onrender.com',
        description: 'Production server (Render)',
      },
    ],
    components: {
      securitySchemes: {
        // NexaSphere uses session-based auth, not bearer tokens
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid',
          description: 'Session cookie set after successful admin login via POST /api/admin/login',
        },
      },
    },
    tags: [
      { name: 'Health', description: 'Server health check' },
      { name: 'Events', description: 'Public and admin event management' },
      { name: 'Core Team', description: 'Core team member management' },
      { name: 'Forms', description: 'Membership and recruitment form submissions' },
      { name: 'Admin', description: 'Admin authentication and management endpoints' },
    ],
  },
  // Tell swagger-jsdoc where to find JSDoc comments with @swagger tags
  apis: ['./routes/*.js', './controllers/*.js', './index.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
