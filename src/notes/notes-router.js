const express = require('express');
const xss = require('xss');
const logger = require('../logger');
const notesRouter = express.Router();
const bodyParser = express.json();
const NotesService = require('./notes-service');
const knex = require('knex');
const knexInstance = knex({
    client: 'pg',
    connection: process.env.DATABASE_URL,
});

const serializeNotes = note => ({
    id: note.id,
    title: xss(note.title),
    date_added: new Date(),
    folder_id: note.folder_id,
    content: xss(note.content)
});

notesRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        NotesService.getAllNotes(knexInstance)
            .then(notes => {
                res.json(notes)
            })
            .catch(next);
    })
    .post(bodyParser, (req, res, next) => {
        const {title, date_added, folder_id, content} = req.body;

        if (!title) {
            const error = 'Name is required';
            logger.error(error);
            return res.status(400).send({
                error: {message: error}
            });
        }
        if (!folder_id) {
            const error = 'FolderID is required';
            logger.error(error);
            return res.status(400).send({
                error: {message: error}
            });
        }
        if (!content) {
            const error = 'Content is required';
            logger.error(error);
            return res.status(400).send({
                error: {message: error}
            });
        }
        const note = {name, date_added, folder_id, content};
        const knexInstance = req.app.get('db');
        NotesService.insertNote(knexInstance, note)
            .then(note => {
                logger.info(`Folder with id ${note.id} created.`);
            res
                .status(201)
                .json(serializeNotes(note));
            })
            .catch(next);
    });
notesRouter
    .route('/:note_id')
    .all((req, res, next) => {
        const {note_id} = req.params;
        NotesService.getById(knexInstance, note_id)
            .then(note => {
                if (!note) {
                    return res.status(404).json({
                        error: {message: `Note doesn't exist`}
                    })
                }
                res.note = note;
                next();
                res.json(serializeNotes(note))
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(res.note)
    })
    .patch(bodyParser, (req, res, next) => {
        const {title, date_added, folder_id, content} = req.body;
        const {note_id} = req.params;
        if (!title) {
            const error = 'Name is required';
            logger.error(error);
            return res.status(400).send({
                error: {message: error}
            });
        }
        if (!folder_id) {
            const error = 'FolderID is required';
            logger.error(error);
            return res.status(400).send({
                error: {message: error}
            });
        }
        if (!content) {
            const error = 'Content is required';
            logger.error(error);
            return res.status(400).send({
                error: {message: error}
            });
        }
        const note = {name, date_added, folder_id, content};
        const knexInstance = req.app.get('db');
        NotesService.updateNotes(knexInstance, note_id, note)
            .then(notes => {
                res.json(notes);
            })
            .catch(next);
    })
    .delete((req, res, next) => {
        const {note_id} = req.params;
        const knexInstance = req.app.get('db');
        NotesService.deleteNote(knexInstance, note_id)
            .then(notes => {
                res.status(204).json(notes);
            })
            .catch(next);
    });
module.exports = notesRouter;
