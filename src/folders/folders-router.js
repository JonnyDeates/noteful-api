const express = require('express');
const xss = require('xss');
const logger = require('../logger');
const foldersRouter = express.Router();
const bodyParser = express.json();
const FolderService = require('./folders-service');
const knex = require('knex');
const knexInstance = knex({
    client: 'pg',
    connection: process.env.DATABASE_URL,
});

const serializeFolder = folder => ({
    id: folder.id,
    name: xss(folder.title)
});

foldersRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        FolderService.getAllFolders(knexInstance)
            .then(folders => {
                res.json(folders)
            })
            .catch(next);
    })
    .post(bodyParser, (req, res, next) => {
        const {name} = req.body;

        if (!name) {
            const error = 'Name is required';
            logger.error(error);
            return res.status(400).send({
                error: {message: error}
            });
        }
        const folder = {name};
        const knexInstance = req.app.get('db');
        FolderService.insertFolder(knexInstance, folder)
            .then(folder => {
                logger.info(`Folder with id ${folder.id} created.`);
            res
                .status(201)
                .json(serializeFolder(folder));
            })
            .catch(next);
    });
foldersRouter
    .route('/:id')
    .all((req, res, next) => {
        const {id} = req.params;
        FolderService.getById(knexInstance, id)
            .then(folder => {
                if (!folder) {
                    return res.status(404).json({
                        error: {message: `Folder doesn't exist`}
                    })
                }
                res.folder = folder;
                next();
                res.json(serializeFolder(folder))
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(res.folder)
    })
    .patch(bodyParser, (req, res, next) => {
        const {name} = req.body;
        const {id} = req.params;
        if (!name) {
            const error = 'Name is required';
            logger.error(error);
            return res.status(400).send(error);
        }
        const folder = {name};
        const knexInstance = req.app.get('db');
        FolderService.updateFolders(knexInstance, id, folder)
            .then(folders => {
                res.json(folders);
            })
            .catch(next);
    })
    .delete((req, res, next) => {
        const {id} = req.params;
        const knexInstance = req.app.get('db');
        FolderService.deleteFolder(knexInstance, id)
            .then(folders => {
                res.status(204).json(folders);
            })
            .catch(next);
    });
module.exports = foldersRouter;
