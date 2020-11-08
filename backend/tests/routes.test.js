import "babel-polyfill";
const request = require('supertest');
const app = require('../app');
const server = require('../config/express')(app);

describe('ChatRoom Endpoints', () => {
  it('should test that true === true', () => {
    expect(true).toBe(true)
  })
})