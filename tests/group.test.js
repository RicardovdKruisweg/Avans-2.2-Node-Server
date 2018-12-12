const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const app = require('../server');
const db = require('middleware/db');

const User = db.User;
const Group = db.Group;

chai.use(chaiHttp);

let testUser = {
    id: null,
    username: 'ricardo',
    password: 'ricardo123',
    displayname: 'ricardo'
};

let token;

let group;

describe('group.js tests', _ => {
    before(done => {
        User.deleteMany({}).then(_ => {
            chai.request(app).post('/users/register').send({
                username: testUser.username,
                password: testUser.password,
                displayname: testUser.displayname
            }).end((err, res) => {
                if (err) {
                    console.error
                    throw err;
                }

                if(res.body.id){
                    testUser.id = res.body.id;

                    chai.request(app).post(`/users/authenticate`).send({ username: testUser.username, password: testUser.password }).end((err, res) => {
                        if(err) throw err
                        token = res.body.token;
                        done();
                    });
                }
            });
        });
    });

    // Clean-up database
    after(done => {
        User.deleteMany({}).then(Group.deleteMany({}).then(done()));
    });

    it('POST /groups - should create a new group', done => {
        chai.request(app).post(`/groups`)
            .set( 'Authorization', `Bearer ${ token }` )
            .send({ name: "RicardoGroup", owner: testUser.id}).end((err, res) => {
                if (err) throw err;
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('_id');
                group = res.body;
                done();
        });
    });

    it('POST /groups - should not create a new group missing token', done => {
        chai.request(app).post(`/groups`)
            .send({ name: "RicardoGroup"}).end((err, res) => {
                if (err) throw err;
                res.should.have.status(401);
                assert.strictEqual(res.body.message, 'Invalid Token');
                done();
        });
    });

    it('POST /groups - should not create a new group missing parameters', done => {
        chai.request(app).post(`/groups`)
            .set( 'Authorization', `Bearer ${ token }` )
            .send({ }).end((err, res) => {
                if (err) throw err;
                res.should.have.status(400);
                done();
        });
    });

    it('PUT /groups - should update group', done => {
        chai.request(app).put(`/groups/${group._id}`)
            .set( 'Authorization', `Bearer ${ token }` )
            .send({ name: 'RicardoGroup2' }).end((err, res) => {
                if (err) throw err;
                res.should.have.status(200);
                group = res.body;
                done();
        });
    });

    it('PUT /groups - should not update group mising parameters', done => {
        chai.request(app).put(`/groups/${group._id}`)
            .set( 'Authorization', `Bearer ${ token }` )
            .send({ }).end((err, res) => {
                if (err) throw err;
                res.should.have.status(400);
                done();
        });
    });

    it('POST groups/comment/:groupId - should comment on group', done => {
        chai.request(app).post(`/groups/comment/${group._id}`)
            .set( 'Authorization', `Bearer ${ token }` )
            .send({ content: 'test' }).end((err, res) => {
                if (err) throw err;
                res.should.have.status(200);
                assert.strictEqual(res.body.messages[0].content, 'test');
                done();
        });
    });

    it('POST groups/comment/:groupId - should not comment on group missing parameters', done => {
        chai.request(app).post(`/groups/comment/${group._id}`)
            .set( 'Authorization', `Bearer ${ token }` )
            .send({ }).end((err, res) => {
                if (err) throw err;
                res.should.have.status(400);
                done();
        });
    });

    it('POST groups/comment/:groupId - should not comment on group missing token', done => {
        chai.request(app).post(`/groups/comment/${group._id}`)
            .send({ content: 'test' }).end((err, res) => {
                if (err) throw err;
                res.should.have.status(401);
                done();
        });
    });

    it('GET groups/user/:userId - should get groups of user', done => {
        // Request groups from user
        chai.request(app).get(`/groups/user/${testUser.id}`)
            .set( 'Authorization', `Bearer ${ token }` )
            .end((err, res) => {
                if (err) throw err;
                res.should.have.status(200);
                assert.strictEqual(res.body.length, 1)
                // Add a new group for this user
                chai.request(app).post(`/groups`)
                    .set( 'Authorization', `Bearer ${ token }` )
                    .send({ name: "RicardoGroup2", owner: testUser.id}).end((err, res) => {
                        if (err) throw err;
                        // User should now have more groups Ricardo van de Kruiweg(2128627)
                        chai.request(app).get(`/groups/user/${testUser.id}`)
                        .set( 'Authorization', `Bearer ${ token }` )
                        .send({ content: 'test' }).end((err, res) => {
                            assert.strictEqual(res.body.length, 2);
                            done();
                        });
                });
        });
    });

    it('GET groups/user/:userId - should not get groups of user invalid user id', done => {
        // Request groups from user
        chai.request(app).get(`/groups/user/122221`)
            .set( 'Authorization', `Bearer ${ token }` )
            .end((err, res) => {
                if (err) throw err;
                res.should.have.status(500);
                done()
        });
    });

    it('DELETE groups/:groupId - should not delete group invalid token', done => {
        // Request groups from user
        chai.request(app).del(`/groups/${group._id}`)
            //.set( 'Authorization', `Bearer ${ token }` )
            .end((err, res) => {
                if (err) throw err;
                res.should.have.status(401);
                done()
        });
    });

    it('DELETE groups/:groupId - should delete group ', done => {
        // Request groups from user
        chai.request(app).del(`/groups/${group._id}`)
            .set( 'Authorization', `Bearer ${ token }` )
            .end((err, res) => {
                if (err) throw err;
                Group.findById( group._id ).then( group => {
                    console.log(group);
                    res.should.have.status(200);
                    done()
                }).catch(err => console.log(err));
        });
    });


    /*
    it('POST /user/register - should not create a new user: Missing parameters', done => {
        chai.request(app).post(`/users/register`).send({  }).end((err, res) => {
            if (err) throw err;
            // Should be handled with error handler and return 400
            res.should.have.status(400);
            done();
        });
    });

    it('POST /user/authenticate - should login user and generate JWT token', done => {
        chai.request(app).post(`/users/authenticate`).send({ username: testUser.username, password: testUser.password }).end((err, res) => {
            if (err) throw err;
            res.body.should.have.property('token');
            token = res.body.token;
            done();
        });
    });

    it('POST /user/authenticate - should not login user password incorrect', done => {
        chai.request(app).post(`/users/authenticate`).send({ username: testUser.username, password: '' }).end((err, res) => {
            if (err) throw err;
            // Should be handled with error handler and return 400
            res.should.have.status(400);
            done();
        });
    });

    it('PUT /users/:id - should update displayname', done => {
        chai.request(app).put(`/users/${testUser.id}`)
            .set( 'Authorization', `Bearer ${ token }` )
            .send({ displayname: 'ricardotest', oldPassword: null, newPassword: null }).end((err, res) => {
                if (err) throw err;
                assert.strictEqual(res.body.displayname, 'ricardotest');
                res.should.have.status(200);
                done();
            });
    });

    it('PUT /users/:id - should not update displayname missing token', done => {
        chai.request(app).put(`/users/${testUser.id}`)
            .send({ displayname: 'ricardotest', oldPassword: null, newPassword: null }).end((err, res) => {
                if (err) throw err;
                assert.strictEqual(res.body.message, 'Invalid Token');
                res.should.have.status(401);
                done();
            });
    });

    it('DELETE /users/:id - should not dleete missing token', done => {
        chai.request(app).del(`/users/${testUser.id}`)
            .end((err, res) => {
                if (err) throw err;
                assert.strictEqual(res.body.message, 'Invalid Token');
                res.should.have.status(401);
                done();
            });
    });

    it('DELETE /users/:id - should delete and be unable to authenticate afterwards', done => {
        chai.request(app).del(`/users/${testUser.id}`)
            .set( 'Authorization', `Bearer ${ token }` )
            .end((err, res) => {
                if (err) throw err;
                res.should.have.status(200);
                chai.request(app).post(`/users/authenticate`).send({ username: testUser.username, password: testUser.password }).end((err, res) => {
                    if (err) throw err;
                    // Proves that the user is deleted in the database
                    res.should.have.status(400);
                    done();
                });
            });
    });*/
});
