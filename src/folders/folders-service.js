const FoldersService = {
    getAllFolders(knex) {
        return knex.select('*').from('folders')
    },
    insertFolder(knex, newFolder) {
        return knex
                .insert(newFolder)
                .into('folders')
            .returning('*')
            .then(rows => rows[0])
},
    getById(knex, id) {
         return knex.from('folders').select('*').where('id', id).first()
    },
    deleteFolder(knex, id) {
        return knex('folders')
             .where({ id })
         .delete()
     },
    updateFolders(knex, id, newFolder) {
      return knex('folders')
              .where({ id })
         .update(newFolder)
     },
};

module.exports = FoldersService;