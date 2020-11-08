import "babel-polyfill";
const request = require('supertest');
const app = require('../app');
const server = require('../config/express')(app);

describe('ChatRoom Endpoints', () => {
  it('should create a new room', async () => {
    const res = await request(app)
      .post('/chatrooms')
      .send({
        name: 'test',
			});
    expect(res.statusCode).toEqual(200);
	});
	it('should receive all chatrooms', async () => {
		const res = await request(app)
			.get('/chatrooms');
		expect(res.statusCode).toEqual(200);
		expect(res.body.length).toEqual(1);
	});
	it('should delete a room', async () => {
    const res = await request(app)
      .delete('/chatrooms')
      .send({
        name: 'test',
			});
    expect(res.statusCode).toEqual(200);
  });
})