require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const foldersRouter = require('./folders/folders-router');
const notesRouter = require('./notes/notes-router');
const app = express();

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';

app.use(morgan(morganOption));
const allowedOrigins = ['https://noteful-client.jonnydeates.now.sh', "https://noteful-client-rho-eight.now.sh/"];
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin - like mobile apps, curl, postman
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));
app.use(helmet());
app.use('/folders', foldersRouter);
app.use('/notes', notesRouter);

module.exports = app;
