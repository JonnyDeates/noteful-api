require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const logger = require('./logger');
const foldersRouter = require('./folders/folders-router');
const notesRouter = require('./notes/notes-router');
const knex = require('knex');
const knexInstance = knex({
  client: 'pg',
  connection: process.env.DB_URL,
});
const app = express();

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';

app.use(morgan(morganOption));
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin - like mobile apps, curl, postman
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not ' +
          'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));
app.use(helmet());
// app.use(function validateBearerToken(req, res, next) {
//   const apiToken = process.env.API_TOKEN;
//   const authToken = req.get('Authorization');
//
//   if (!authToken || authToken.split(' ')[1] !== apiToken) {
//     logger.error(`Unathorized request to path: ${req.path}`);
//     return res.status(401).json({
//       error: 'Unathorized request'
//     });
//   }
//
//   next();
// });

app.use('/folders', foldersRouter);
app.use('/notes', notesRouter);
//app.use(errorHandler);

function errorHandler(error, req, res, next) {
  const code = error.status || 500;
  if (NODE_ENV === 'production') {
    error.message = code === 500 ? 'internal server error' : error.message;
  } else {
    console.error(error);
  }
  res.status(code).json({message: error.message});
}

module.exports = app;
