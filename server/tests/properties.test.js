const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcryptjs');
const app = require('../server');
const Property = require('../models/property');
const User = require('../models/user');

let mongoServer;
let authToken;

beforeAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  
  // Create a test user and get auth token
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: hashedPassword
  });
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test@example.com', password: 'password123' });
  authToken = res.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Property.deleteMany();
  await User.deleteMany();
});

describe('Property Routes', () => {
  describe('POST /api/properties/add', () => {
    it('should create a new property', async () => {
      const res = await request(app)
        .post('/api/properties/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Property',
          description: 'A nice property',
          price: 500000,
          location: 'Test Location',
          state: 'Test State',
          district: 'Test District',
          type: 'sell',
          area: 1500,
          beds: 3,
          baths: 2,
          garages: 1,
          images: ['http://example.com/image1.jpg']
        });
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should not create property without auth', async () => {
      const res = await request(app)
        .post('/api/properties/add')
        .send({
          title: 'Test Property',
          price: 500000
        });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/properties', () => {
    beforeEach(async () => {
      await Property.create({
        title: 'Test Property 1',
        description: 'A nice property',
        price: 500000,
        location: 'Test Location',
        state: 'Test State',
        district: 'Test District',
        type: 'sell',
        area: 1500,
        beds: 3,
        baths: 2,
        garages: 1,
        ownerName: 'Test Owner'
      });
    });

    it('should get all properties', async () => {
      const res = await request(app).get('/api/properties');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.properties).toHaveLength(1);
    });
  });

  describe('GET /api/properties/:id', () => {
    it('should get a property by id', async () => {
      const property = await Property.create({
        title: 'Test Property',
        description: 'A nice property',
        price: 500000,
        location: 'Test Location',
        state: 'Test State',
        district: 'Test District',
        type: 'sell',
        area: 1500,
        beds: 3,
        baths: 2,
        garages: 1,
        ownerName: 'Test Owner'
      });
      const res = await request(app).get(`/api/properties/${property._id}/view`);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.property.title).toBe('Test Property');
    });
  });

  describe('DELETE /api/properties/:id', () => {
    it('should not delete property without admin role', async () => {
      const property = await Property.create({
        title: 'Test Property',
        description: 'A nice property',
        price: 500000,
        location: 'Test Location',
        state: 'Test State',
        district: 'Test District',
        type: 'sell',
        area: 1500,
        beds: 3,
        baths: 2,
        garages: 1,
        ownerName: 'Test Owner'
      });
      const res = await request(app)
        .delete(`/api/properties/${property._id}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.statusCode).toBe(403);
    });
  });
});
