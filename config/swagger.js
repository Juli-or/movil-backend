const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AgroSoft API',
      version: '1.0.0',
      description: 'Documentación de la API de AgroSoft',
      contact: {
        name: 'Soporte AgroSoft',
        email: 'soporte@agrosoft.com',
      },
    },
    servers: [
      {
        url: 'http://127.0.0.1:4000',
        description: 'Servidor de Desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js', './models/*.js'], // Archivos donde buscar anotaciones
};

const swaggerSpec = swaggerJsdoc(options);

const swaggerDocs = (app, port) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  console.log(` Documentación de Swagger disponible en http://127.0.0.1:${port}/api/docs`);
};

module.exports = { swaggerDocs };

