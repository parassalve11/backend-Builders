const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const request = require('supertest');

process.env.NODE_ENV = 'test';
const app = require('../src/app');
const { env } = require('../src/config/env');
const Engineer = require('../src/models/Engineer');
const AdminUser = require('../src/models/AdminUser');
const Project = require('../src/models/Project');
const { portalAccessBodySchema } = require('../src/validators/engineerValidators');
const {
  serializeOpportunity,
  serializeProject,
  ownedProjectsFilter,
  relevantOpportunitiesFilter,
} = require('../src/services/engineerPortalService');

function fakeEngineer(overrides = {}) {
  return {
    _id: new mongoose.Types.ObjectId(),
    pseudonymCode: 'ENG-YVT-01',
    fullName: 'Portal Engineer',
    email: 'portal@example.com',
    phone: '9876543210',
    city: 'Yavatmal',
    cityCode: 'YVT',
    engineerType: 'civil_engineer',
    accountStatus: 'active',
    availabilityStatus: 'available',
    password: 'selected-hash-placeholder',
    tokenVersion: 0,
    verifyPassword: async (candidate) => candidate === 'StrongPortal1!',
    save: async () => undefined,
    ...overrides,
  };
}

test('engineer login returns a role-separated JWT and a generic failure', async () => {
  const originalFindOne = Engineer.findOne;
  try {
    const engineer = fakeEngineer();
    Engineer.findOne = () => ({ select: async () => engineer });
    const response = await request(app)
      .post('/api/engineer/auth/login')
      .send({ email: 'PORTAL@example.com', password: 'StrongPortal1!' })
      .expect(200);

    assert.equal(response.body.success, true);
    assert.equal(response.body.data.engineer.email, 'portal@example.com');
    assert.equal(response.body.data.engineer.password, undefined);
    const payload = jwt.verify(response.body.data.token, env.jwtSecret, {
      algorithms: ['HS256'],
      issuer: 'rkabh-api',
      audience: 'rkabh-engineer',
    });
    assert.equal(payload.role, 'engineer');
    assert.equal(payload.sub, String(engineer._id));

    await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${response.body.data.token}`)
      .expect(401);

    Engineer.findOne = () => ({ select: async () => null });
    const denied = await request(app)
      .post('/api/engineer/auth/login')
      .send({ email: 'missing@example.com', password: 'StrongPortal1!' })
      .expect(401);
    assert.equal(denied.body.message, 'Invalid email or password');
  } finally {
    Engineer.findOne = originalFindOne;
  }
});

test('project endpoint derives scope from the authenticated engineer, not query input', async () => {
  const originalEngineerFindOne = Engineer.findOne;
  const originalProjectFind = Project.find;
  const originalProjectCount = Project.countDocuments;
  const engineer = fakeEngineer();
  const otherEngineerId = String(new mongoose.Types.ObjectId());
  const capturedFilters = [];

  try {
    Engineer.findOne = () => ({ select: async () => engineer });
    Project.find = (filter) => {
      capturedFilters.push(filter);
      const query = {
        select: () => query,
        sort: () => query,
        skip: () => query,
        limit: () => query,
        lean: async () => [],
      };
      return query;
    };
    Project.countDocuments = async (filter) => {
      capturedFilters.push(filter);
      return 0;
    };

    const token = jwt.sign({ role: 'engineer', tv: 0 }, env.jwtSecret, {
      algorithm: 'HS256',
      expiresIn: '5m',
      subject: String(engineer._id),
      issuer: 'rkabh-api',
      audience: 'rkabh-engineer',
    });
    await request(app)
      .get(`/api/engineer/projects?engineer=${otherEngineerId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    assert.equal(capturedFilters.length, 2);
    for (const filter of capturedFilters) {
      assert.equal(String(filter.engineer), String(engineer._id));
      assert.notEqual(String(filter.engineer), otherEngineerId);
    }
  } finally {
    Engineer.findOne = originalEngineerFindOne;
    Project.find = originalProjectFind;
    Project.countDocuments = originalProjectCount;
  }
});

test('scope helpers and DTOs exclude cross-engineer and internal/customer opportunity data', () => {
  const ownId = new mongoose.Types.ObjectId();
  assert.deepEqual(ownedProjectsFilter(ownId), { engineer: ownId });
  assert.deepEqual(relevantOpportunitiesFilter(ownId), {
    $or: [{ assignedEngineer: ownId }, { engineer: ownId }],
  });

  const opportunity = serializeOpportunity({
    _id: new mongoose.Types.ObjectId(),
    leadCode: 'KABH-LD-TEST',
    city: 'Yavatmal',
    projectType: 'Residential',
    projectDetails: 'Call 9876543210 or owner@example.com about the plan',
    customerName: 'Private Customer',
    phone: '9876543210',
    email: 'owner@example.com',
    budgetRange: 'private',
    adminNotes: 'private',
  });
  assert.equal(opportunity.customerName, undefined);
  assert.equal(opportunity.phone, undefined);
  assert.equal(opportunity.email, undefined);
  assert.equal(opportunity.budgetRange, undefined);
  assert.equal(opportunity.adminNotes, undefined);
  assert.equal(opportunity.projectBrief.includes('9876543210'), false);
  assert.equal(opportunity.projectBrief.includes('owner@example.com'), false);

  const project = serializeProject({
    _id: new mongoose.Types.ObjectId(),
    projectCode: 'KABH-PROJ-TEST',
    customerName: 'Assigned Customer',
    customerPhone: '9876543210',
    customerEmail: 'assigned@example.com',
    constructionLocation: 'Assigned site',
    estimatedCost: 5000000,
    finalCost: 5100000,
    adminManager: new mongoose.Types.ObjectId(),
    internalNotes: 'private',
    delayReason: 'private',
  });
  assert.equal(project.customer.name, 'Assigned Customer');
  assert.equal(project.estimatedCost, undefined);
  assert.equal(project.finalCost, undefined);
  assert.equal(project.adminManager, undefined);
  assert.equal(project.internalNotes, undefined);
  assert.equal(project.delayReason, undefined);
});

test('portal access validation requires a strong password and normalizes email', () => {
  const weak = portalAccessBodySchema.safeParse({
    email: 'engineer@example.com',
    password: 'password1234',
  });
  assert.equal(weak.success, false);

  const valid = portalAccessBodySchema.parse({
    email: '  PORTAL.Engineer@Example.COM ',
    password: 'NewPortalPass1!',
  });
  assert.equal(valid.email, 'portal.engineer@example.com');
  assert.equal(valid.password, 'NewPortalPass1!');
});

test('admin can reset portal access without exposing credentials and existing sessions are revoked', async () => {
  const originalAdminFindOne = AdminUser.findOne;
  const originalEngineerFindById = Engineer.findById;
  const engineerId = new mongoose.Types.ObjectId();
  const adminId = new mongoose.Types.ObjectId();
  let saveCalled = 0;
  let passwordPassedToSave;
  const engineer = {
    _id: engineerId,
    pseudonymCode: 'ENG-YVT-01',
    accountStatus: 'active',
    email: 'old@example.com',
    password: 'existing-selected-hash',
    tokenVersion: 4,
    lastLoginAt: new Date('2026-08-01T10:00:00.000Z'),
    async save() {
      saveCalled += 1;
      passwordPassedToSave = this.password;
      this.password = '$2a$12$not-returned-hash';
    },
  };

  try {
    AdminUser.findOne = () => ({
      select: async () => ({
        _id: adminId,
        role: 'admin',
        isActive: true,
        tokenVersion: 0,
      }),
    });
    Engineer.findById = (id) => {
      assert.equal(String(id), String(engineerId));
      return { select: async () => engineer };
    };
    const token = jwt.sign({ role: 'admin', tv: 0 }, env.jwtSecret, {
      algorithm: 'HS256',
      expiresIn: '5m',
      subject: String(adminId),
      issuer: 'rkabh-api',
      audience: 'rkabh-admin',
    });

    const response = await request(app)
      .put(`/api/admin/engineers/${engineerId}/portal-access`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'NEW.Engineer@Example.com', password: 'NewPortalPass1!' })
      .expect(200);

    assert.equal(saveCalled, 1);
    assert.equal(passwordPassedToSave, 'NewPortalPass1!');
    assert.equal(engineer.tokenVersion, 5);
    assert.deepEqual(response.body.data.portalAccess, {
      enabled: true,
      canLogin: true,
      email: 'new.engineer@example.com',
      lastLoginAt: '2026-08-01T10:00:00.000Z',
      sessionsRevoked: true,
    });
    assert.equal(response.body.data.password, undefined);
    assert.equal(JSON.stringify(response.body).includes('NewPortalPass1!'), false);
    assert.equal(JSON.stringify(response.body).includes('not-returned-hash'), false);
  } finally {
    AdminUser.findOne = originalAdminFindOne;
    Engineer.findById = originalEngineerFindById;
  }
});
