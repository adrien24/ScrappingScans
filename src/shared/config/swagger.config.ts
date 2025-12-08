import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'ScrappingScan API',
            version: '1.0.0',
            description: 'API pour la gestion et le scraping de scans de mangas',
            contact: {
                name: 'API Support',
                email: 'adrien.bouteiller01@gmail.com',
            },
        },
        servers: [
            {
                url: 'https://api.adrienbouteiller.fr',
                description: 'Production server',
            },
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
        ],
        tags: [
            {
                name: 'Health',
                description: 'Health check endpoints',
            },
            {
                name: 'Mangas',
                description: 'Manga management endpoints',
            },
            {
                name: 'Scraping',
                description: 'Web scraping endpoints',
            },
        ],
        paths: {
            '/health': {
                get: {
                    summary: 'Vérifier l\'état de santé de l\'API',
                    tags: ['Health'],
                    responses: {
                        '200': {
                            description: 'API opérationnelle',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: {
                                                type: 'string',
                                                example: 'ok',
                                            },
                                            timestamp: {
                                                type: 'string',
                                                format: 'date-time',
                                            },
                                            uptime: {
                                                type: 'number',
                                                description: 'Uptime en secondes',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    apis: ['./src/api/routes/*.ts', './src/api/controllers/*.ts'],
}

export const swaggerSpec = swaggerJsdoc(options)
