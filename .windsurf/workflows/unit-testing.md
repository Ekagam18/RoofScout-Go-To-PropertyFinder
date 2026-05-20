---
description: How to run and write unit tests using Jest
---

# Unit Testing Workflow

## Setup (Already Done)

1. **Install Dependencies**:
   ```bash
   cd Backend
   npm install --save-dev jest supertest mongodb-memory-server
   ```

2. **Update package.json**:
   - Test script: `"test": "jest --detectOpenHandles"`
   - Server exports app for testing (NODE_ENV=test check)

3. **Test Files Created**:
   - `Backend/tests/auth.test.js` - Authentication tests
   - `Backend/tests/properties.test.js` - Property CRUD tests

## Running Tests

1. **Run All Tests**:
   ```bash
   cd Backend
   npm test
   ```

2. **Run Specific Test File**:
   ```bash
   npm test auth.test.js
   npm test properties.test.js
   ```

3. **Run in Watch Mode** (for development):
   ```bash
   npm test -- --watch
   ```

## Test Coverage

### Auth Tests (`auth.test.js`)
- POST /api/auth/register - Create new user
- POST /api/auth/register - Reject duplicate email
- POST /api/auth/login - Login with valid credentials
- POST /api/auth/login - Reject invalid credentials

### Property Tests (`properties.test.js`)
- POST /api/properties/add - Create property with auth
- POST /api/properties/add - Reject without auth
- GET /api/properties - Get all properties
- GET /api/properties/:id - Get property by ID
- DELETE /api/properties/:id - Delete property with auth

## Writing New Tests

1. **Create test file** in `Backend/tests/`
2. **Import dependencies**:
   ```javascript
   const request = require('supertest');
   const mongoose = require('mongoose');
   const { MongoMemoryServer } = require('mongodb-memory-server');
   const app = require('../server');
   const Model = require('../models/model');
   ```

3. **Setup test database**:
   ```javascript
   let mongoServer;
   beforeAll(async () => {
     if (mongoose.connection.readyState !== 0) {
       await mongoose.disconnect();
     }
     mongoServer = await MongoMemoryServer.create();
     await mongoose.connect(mongoServer.getUri());
   });
   ```

4. **Cleanup**:
   ```javascript
   afterAll(async () => {
     await mongoose.disconnect();
     await mongoServer.stop();
   });
   ```

## Troubleshooting

- **Connection error**: Make sure server.js exports app and checks NODE_ENV
- **Port in use**: Tests don't start server (NODE_ENV=test)
- **Test fails**: Check if model imports match actual file names (case-sensitive)
