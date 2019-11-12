const knex = require('knex');
const fixtures = require('./folders-fixtures');
const app = require('../src/app');

describe('Folders Endpoints', () => {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db)
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => db('folders').truncate());

  afterEach('cleanup', () => db('folders').truncate());

  // describe(`Unauthorized requests`, () => {
  //   const testBookmarks = fixtures.makeFoldersArray();
  //
  //   beforeEach('insert folders', () => {
  //     return db
  //         .into('folders')
  //         .insert(testBookmarks)
  //   });
  //
  //   it(`responds with 401 Unauthorized for GET /bookmarks`, () => {
  //     return supertest(app)
  //         .get('/bookmarks')
  //         .expect(401, { error: 'Unauthorized request' })
  //   });
  //
  //   it(`responds with 401 Unauthorized for POST /bookmarks`, () => {
  //     return supertest(app)
  //         .post('/bookmarks')
  //         .send({ title: 'test-title', url: 'http://some.thing.com', rating: 1 })
  //         .expect(401, { error: 'Unauthorized request' })
  //   });
  //
  //   it(`responds with 401 Unauthorized for GET /bookmarks/:id`, () => {
  //     const secondBookmark = testBookmarks[1];
  //     return supertest(app)
  //         .get(`/bookmarks/${secondBookmark.id}`)
  //         .expect(401, { error: 'Unauthorized request' })
  //   });
  //
  //   it(`responds with 401 Unauthorized for DELETE bookmarks/:id`, () => {
  //     const aBookmark = testBookmarks[1];
  //     return supertest(app)
  //         .delete(`/bookmarks/${aBookmark.id}`)
  //         .expect(401, { error: 'Unauthorized request' })
  //   });
  //
  //   it(`responds with 401 Unauthorized for PATCH /bookmarks/:id`, () => {
  //     const aBookmark = testBookmarks[1];
  //     return supertest(app)
  //         .patch(`/bookmarks/${aBookmark.id}`)
  //         .send({ title: 'updated-title' })
  //         .expect(401, { error: 'Unauthorized request' })
  //   })
  // });

  describe('GET /folders', () => {
    context(`Given no bookmarks`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
            .get('/folders')
            //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .expect(200, [])
      })
    });

    context('Given there are folders in the database', () => {
      const testBookmarks = fixtures.makeFoldersArray();

      beforeEach('insert bookmarks', () => {
        return db
            .into('folders')
            .insert(testBookmarks)
      });

      it('gets the folders from the store', () => {
        return supertest(app)
            .get('/folders')
           // .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .expect(200, testBookmarks)
      })
    });

    context(`Given an XSS attack bookmark`, () => {
      const { maliciousFolder, expectedFolder } = fixtures.makeMaliciousFolder();

      beforeEach('insert malicious bookmark', () => {
        return db
            .into('folders')
            .insert([maliciousFolder])
      });

      it('removes XSS attack content', () => {
        return supertest(app)
            .get(`/folders`)
            //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .expect(200)
            .expect(res => {
              expect(res.body[0].name).to.eql(maliciousFolder.name);
            })
      })
    })
  });

  // describe('GET /bookmarks/:id', () => {
  //   context(`Given no bookmarks`, () => {
  //     it(`responds 404 whe bookmark doesn't exist`, () => {
  //       return supertest(app)
  //           .get(`/bookmarks/123`)
  //           //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
  //           .expect(404, {
  //             error: { message: `Bookmark doesn't exist` }
  //           })
  //     })
  //   });
  //
  //   context('Given there are bookmarks in the database', () => {
  //     const testBookmarks = fixtures.makeBookmarksArray();
  //
  //     beforeEach('insert bookmarks', () => {
  //       return db
  //           .into('bookmarks_table')
  //           .insert(testBookmarks)
  //     });
  //
  //     it('responds with 200 and the specified bookmark', () => {
  //       const bookmarkId = 2;
  //       const expectedBookmark = testBookmarks[bookmarkId - 1];
  //       return supertest(app)
  //           .get(`/bookmarks/${bookmarkId}`)
  //          // .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
  //           .expect(200, expectedBookmark)
  //     })
  //   });
  //
  //   context(`Given an XSS attack bookmark`, () => {
  //     const { maliciousBookmark, expectedBookmark } = fixtures.makeMaliciousBookmark();
  //
  //     beforeEach('insert malicious bookmark', () => {
  //       return db
  //           .into('bookmarks_table')
  //           .insert([maliciousBookmark])
  //     });
  //
  //     it('removes XSS attack content', () => {
  //       return supertest(app)
  //           .get(`/bookmarks/${maliciousBookmark.id}`)
  //          // .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
  //           .expect(200)
  //           .expect(res => {
  //             expect(res.body.title).to.eql(expectedBookmark.title);
  //             expect(res.body.description).to.eql(expectedBookmark.description)
  //           })
  //     })
  //   })
  // });
  //
  // describe('DELETE /bookmarks/:id', () => {
  //   context(`Given no bookmarks`, () => {
  //     it(`responds 404 whe bookmark doesn't exist`, () => {
  //       return supertest(app)
  //           .delete(`/bookmarks/123`)
  //          // .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
  //           .expect(404, {
  //             error: { message: `Bookmark doesn't exist` }
  //           })
  //     })
  //   });
  //
  //   context('Given there are bookmarks in the database', () => {
  //     const testBookmarks = fixtures.makeBookmarksArray();
  //
  //     beforeEach('insert bookmarks', () => {
  //       return db
  //           .into('bookmarks_table')
  //           .insert(testBookmarks)
  //     });
  //
  //     it('removes the bookmark by ID from the store', () => {
  //       const idToRemove = 2;
  //       const expectedBookmarks = testBookmarks.filter(bm => bm.id !== idToRemove);
  //       return supertest(app)
  //           .delete(`/bookmarks/${idToRemove}`)
  //           //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
  //           .expect(204)
  //           .then(() =>
  //               supertest(app)
  //                   .get(`/bookmarks`)
  //                   //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
  //                   .expect(expectedBookmarks)
  //           )
  //     })
  //   })
  // });
  //
  // describe('POST /bookmarks', () => {
  //   ['title', 'url', 'rating'].forEach(field => {
  //     const newBookmark = {
  //       title: 'test-title',
  //       url: 'https://test.com',
  //       rating: 2,
  //     };
  //
  //     it(`responds with 400 missing '${field}' if not supplied`, () => {
  //       delete newBookmark[field];
  //
  //       return supertest(app)
  //           .post(`/bookmarks`)
  //           .send(newBookmark)
  //           //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
  //           .expect(400, {
  //             error: { message: `'${field}' is required` }
  //           })
  //     })
  //   });
  //
  //   it(`responds with 400 invalid 'rating' if not between 0 and 5`, () => {
  //     const newBookmarkInvalidRating = {
  //       title: 'test-title',
  //       url: 'https://test.com',
  //       rating: 'invalid',
  //     };
  //     return supertest(app)
  //         .post(`/bookmarks`)
  //         .send(newBookmarkInvalidRating)
  //        // .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
  //         .expect(400, {
  //           error: { message: `'rating' must be a number between 0 and 5` }
  //         })
  //   });
  //
  //   it(`responds with 400 invalid 'url' if not a valid URL`, () => {
  //     const newBookmarkInvalidUrl = {
  //       title: 'test-title',
  //       url: 'htp://invalid-url',
  //       rating: 1,
  //     };
  //     return supertest(app)
  //         .post(`/bookmarks`)
  //         .send(newBookmarkInvalidUrl)
  //        // .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
  //         .expect(400, {
  //           error: { message: `'url' must be a valid URL` }
  //         })
  //   });
  //
  //   it('adds a new bookmark to the store', () => {
  //     const newBookmark = {
  //       title: 'test-title',
  //       url: 'https://test.com',
  //       description: 'test description',
  //       rating: 1,
  //     };
  //     return supertest(app)
  //         .post(`/bookmarks`)
  //         .send(newBookmark)
  //        // .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
  //         .expect(201)
  //         .expect(res => {
  //           expect(res.body.title).to.eql(newBookmark.title);
  //           expect(res.body.url).to.eql(newBookmark.url);
  //           expect(res.body.description).to.eql(newBookmark.description);
  //           expect(res.body.rating).to.eql(newBookmark.rating);
  //           expect(res.body).to.have.property('id');
  //           expect(res.headers.location).to.eql(`/bookmarks/${res.body.id}`)
  //         })
  //         .then(res =>
  //             supertest(app)
  //                 .get(`/bookmarks/${res.body.id}`)
  //                // .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
  //                 .expect(res.body)
  //         )
  //   });
  //
  //   it('removes XSS attack content from response', () => {
  //     const { maliciousBookmark, expectedBookmark } = fixtures.makeMaliciousBookmark()
  //     return supertest(app)
  //         .post(`/bookmarks`)
  //         .send(maliciousBookmark)
  //        // .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
  //         .expect(201)
  //         .expect(res => {
  //           expect(res.body.title).to.eql(expectedBookmark.title);
  //           expect(res.body.description).to.eql(expectedBookmark.description)
  //         })
  //   })
  // });
  //
  // describe(`PATCH /bookmarks/:bookmark_id`, () => {
  //   context(`Given no bookmarks`, () => {
  //     it(`responds with 404`, () => {
  //       const bookmarkId = 123456;
  //       return supertest(app)
  //           .patch(`/bookmarks/${bookmarkId}`)
  //          // .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
  //           .expect(404, { error: { message: `Bookmark doesn't exist` } })
  //     })
  //   });
  //
  //   context('Given there are bookmarks in the database', () => {
  //     const testBookmarks = fixtures.makeBookmarksArray();
  //
  //     beforeEach('insert bookmarks', () => {
  //       return db
  //           .into('bookmarks')
  //           .insert(testBookmarks)
  //     });
  //
  //     it('responds with 204 and updates the bookmark', () => {
  //       const idToUpdate = 2;
  //       const updateBookmark = {
  //         title: 'updated bookmark title',
  //         url: 'https://updated-url.com',
  //         description: 'updated bookmark description',
  //         rating: 1,
  //       };
  //       const expectedArticle = {
  //         ...testBookmarks[idToUpdate - 1],
  //         ...updateBookmark
  //       };
  //       return supertest(app)
  //           .patch(`/bookmarks/${idToUpdate}`)
  //           //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
  //           .send(updateBookmark)
  //           .expect(204)
  //           .then(res =>
  //               supertest(app)
  //                   .get(`/bookmarks/${idToUpdate}`)
  //              //     .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
  //                   .expect(expectedArticle)
  //           )
  //     });
  //
  //     it(`responds with 400 when no required fields supplied`, () => {
  //       const idToUpdate = 2;
  //       return supertest(app)
  //           .patch(`/bookmarks/${idToUpdate}`)
  //          // .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
  //           .send({ irrelevantField: 'foo' })
  //           .expect(400, {
  //             error: {
  //               message: `Request body must content either 'title', 'url', 'description' or 'rating'`
  //             }
  //           })
  //     });
  //
  //     it(`responds with 204 when updating only a subset of fields`, () => {
  //       const idToUpdate = 2;
  //       const updateBookmark = {
  //         title: 'updated bookmark title',
  //       };
  //       const expectedBookmark = {
  //         ...testBookmarks[idToUpdate - 1],
  //         ...updateBookmark
  //       };
  //
  //       return supertest(app)
  //           .patch(`/bookmarks/${idToUpdate}`)
  //         //  .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
  //           .send({
  //             ...updateBookmark,
  //             fieldToIgnore: 'should not be in GET response'
  //           })
  //           .expect(204)
  //           .then(res =>
  //               supertest(app)
  //                   .get(`/bookmarks/${idToUpdate}`)
  //                   //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
  //                   .expect(expectedBookmark)
  //           )
  //     });
  //
  //     it(`responds with 400 invalid 'rating' if not between 0 and 5`, () => {
  //       const idToUpdate = 2;
  //       const updateInvalidRating = {
  //         rating: 'invalid',
  //       };
  //       return supertest(app)
  //           .patch(`/bookmarks/${idToUpdate}`)
  //           //.set('Authorization', `Bearer ${process.env.API_TOKEN}`)
  //           .send(updateInvalidRating)
  //           .expect(400, {
  //             error: {
  //               message: `'rating' must be a number between 0 and 5`
  //             }
  //           })
  //     });
  //
  //     it(`responds with 400 invalid 'url' if not a valid URL`, () => {
  //       const idToUpdate = 2;
  //       const updateInvalidUrl = {
  //         url: 'htp://invalid-url',
  //       };
  //       return supertest(app)
  //           .patch(`/bookmarks/${idToUpdate}`)
  //          // .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
  //           .send(updateInvalidUrl)
  //           .expect(400, {
  //             error: {
  //               message: `'url' must be a valid URL`
  //             }
  //           })
  //     })
  //   })
  // })
});