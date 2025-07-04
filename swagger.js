import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BizNest API',
      version: '1.0.0',
      description: 'API documentation for BizNest user management system',
      contact: {
        name: 'BizNest Team',
        email: 'support@biznest.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://your-domain.com' 
          : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string', nullable: true },
            email: { type: 'string', nullable: true },
            image: { type: 'string', nullable: true },
            emailVerified: { type: 'string', nullable: true },
            firstName: { type: 'string', nullable: true },
            lastName: { type: 'string', nullable: true },
            screenName: { type: 'string', nullable: true },
            industry: { type: 'string', nullable: true },
            profile: {
              type: 'object',
              nullable: true,
              properties: {
                id: { type: 'integer' },
                firstName: { type: 'string', nullable: true },
                lastName: { type: 'string', nullable: true },
                screenName: { type: 'string', nullable: true },
                industry: { type: 'string', nullable: true },
                userId: { type: 'integer' },
                role: { type: 'string', enum: ['admin', 'customer', 'user'] }
              }
            }
          }
        },
        PaginatedUsers: {
          type: 'object',
          properties: {
            users: {
              type: 'array',
              items: { $ref: '#/components/schemas/User' }
            },
            totalPages: { type: 'integer' },
            currentPage: { type: 'integer' },
            totalUsers: { type: 'integer' },
            hasNextPage: { type: 'boolean' },
            hasPrevPage: { type: 'boolean' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  },
  apis: ['./app/api/**/*.ts'], // Path to your API route files
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec; 