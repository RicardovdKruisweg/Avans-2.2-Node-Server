const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const app = require('../server');
const db = require('middleware/db');

const User = db.User;

chai.use(chaiHttp);

let testUser = {
    id: null,
    username: 'ricardo',
    password: 'ricardo123',
    displayname: 'ricardo'
};

let testUser2 = {
    id: null,
    username: 'ricardo2',
    password: 'ricardo123',
    displayname: 'ricardo'
};

let token;

describe('user.js tests', _ => {
    before(done => {
        User.deleteMany({}).then(_ => {
            chai.request(app).post('/users/register').send({
                username: testUser2.username,
                password: testUser2.password,
                displayname: testUser2.displayname
            }).end((err, res) => {
                if (err) {
                    console.error
                    throw err;
                }

                if(res.body.id){
                    testUser2.id = res.body.id;
                    done();
                }
            });
        });
    });

    // Clean-up database
    after(done => {
        User.deleteMany({}).then(done());
    });

    it('POST /users/regoster - should create a new user', done => {
        chai.request(app).post(`/users/register`).send(testUser).end((err, res) => {
            if (err) throw err;
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('id');
            testUser.id = res.body.id;
            done();
        });
    });

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
    });
});
