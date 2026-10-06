import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app } from '../src/app.js';
import { AuditLog } from '../src/models/audit-log.model.js';
import { Channel } from '../src/models/channel.model.js';
import { Report } from '../src/models/report.model.js';
import { Session } from '../src/models/session.model.js';
import { User } from '../src/models/user.model.js';
import { escalateOldReports } from '../src/jobs/report-escalation.job.js';

jest.mock('../src/notifications/report-email.js', () => ({
  sendReportCreatedEmail: jest.fn(),
  sendReportResolvedEmail: jest.fn()
}));
jest.mock('../src/realtime/socket.js', () => ({
  emitReportCreated: jest.fn(),
  emitReportUpdated: jest.fn()
}));

let mongo: MongoMemoryServer;
let channelId: string;
const password = 'StrongPass123!';

async function register(email: string) {
  const agent = request.agent(app);
  await agent.post('/api/auth/register').send({ email, password }).expect(201);
  return agent;
}

async function admin(email: string) {
  const agent = await register(email);
  await User.updateOne({ email }, { role: 'ADMIN' });
  await agent.post('/api/auth/login').send({ email, password }).expect(200);
  return agent;
}

async function createReport(agent: ReturnType<typeof request.agent>, description = 'Picture is frozen.') {
  const result = await agent.post('/api/reports').field({ channelId, reason: 'VIDEO_PROBLEM', description }).expect(201);
  return result.body.report._id as string;
}

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

beforeEach(async () => {
  await Promise.all([
    AuditLog.deleteMany({}), Report.deleteMany({}), Session.deleteMany({}),
    User.deleteMany({}), Channel.deleteMany({})
  ]);
  const channel = await Channel.create({
    name: 'Audit Channel', logoUrl: 'https://example.com/logo.png',
    streamUrl: 'https://example.com/live.m3u8', country: 'Mexico',
    categories: ['News'], isActive: true
  });
  channelId = channel.id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

// Session 16 instructor-solution checks: enable these after the five Report audit calls are live-coded.
test.skip('Report create and update persist concise audit logs after each change', async () => {
  const owner = await register('reporter@example.com');
  const reportId = await createReport(owner);
  await owner.patch(`/api/reports/${reportId}`).send({
    reason: 'AUDIO_PROBLEM', description: 'The sound is delayed.', status: 'IN_PROGRESS'
  }).expect(200);

  const logs = await AuditLog.find({ resourceId: reportId, category: 'REPORT' }).sort('createdAt');
  expect(logs.map((log) => log.action)).toEqual(['REPORT_CREATED', 'REPORT_UPDATED']);
  expect(logs[0].metadata).toEqual(expect.objectContaining({ channelId, channelName: 'Audit Channel', initialStatus: 'OPEN' }));
  expect(logs[1].metadata).toEqual({ changedFields: ['reason', 'description', 'status'], previousStatus: 'OPEN', newStatus: 'IN_PROGRESS' });
  expect(JSON.stringify(logs)).not.toContain('The sound is delayed.');
});

test.skip('deleting a Report retains its audit history', async () => {
  const owner = await register('delete-audit@example.com');
  const reportId = await createReport(owner);
  await owner.delete(`/api/reports/${reportId}`).expect(204);
  expect(await Report.exists({ _id: reportId })).toBeNull();
  expect((await AuditLog.find({ resourceId: reportId, category: 'REPORT' })).map((log) => log.action))
    .toEqual(expect.arrayContaining(['REPORT_CREATED', 'REPORT_DELETED']));
});

test.skip('cron escalation and ADMIN resolution audit saved transitions', async () => {
  const owner = await register('escalation@example.com');
  const reportId = await createReport(owner);
  await Report.collection.updateOne({ _id: new mongoose.Types.ObjectId(reportId) }, { $set: { createdAt: new Date(Date.now() - 5 * 60_000) } });

  expect(await escalateOldReports()).toBe(1);
  const escalation = await AuditLog.findOne({ resourceId: reportId, action: 'REPORT_ESCALATED' });
  expect(escalation).toEqual(expect.objectContaining({ actorType: 'SYSTEM', actorId: null }));
  expect(escalation?.metadata).toEqual(expect.objectContaining({ previousStatus: 'OPEN', newStatus: 'ESCALATED' }));

  const support = await admin('admin@example.com');
  await support.patch(`/api/admin/reports/${reportId}/close`).expect(200);
  await support.patch(`/api/admin/reports/${reportId}/close`).expect(200);
  const resolutions = await AuditLog.find({ resourceId: reportId, action: 'REPORT_RESOLVED' });
  expect(resolutions).toHaveLength(1);
  expect(resolutions[0].actorType).toBe('ADMIN');
  expect(resolutions[0].metadata).toEqual(expect.objectContaining({ previousStatus: 'ESCALATED', newStatus: 'RESOLVED' }));
});

test('ADMIN sees only requested Report logs, newest first; USER gets 403', async () => {
  const owner = await register('history@example.com');
  const firstId = await createReport(owner);
  const secondId = await createReport(owner, 'Other report.');
  await owner.patch(`/api/reports/${firstId}`).send({ reason: 'OTHER', description: 'Changed.', status: 'OPEN' }).expect(200);
  const support = await admin('history-admin@example.com');

  await owner.get(`/api/admin/reports/${firstId}/logs`).expect(403);
  expect((await support.get(`/api/admin/reports/${firstId}/logs`).expect(200)).body.logs).toEqual([]);
  const actorId = (await User.findOne({ email: 'history@example.com' }))!.id;
  await AuditLog.create({ category: 'REPORT', action: 'REPORT_CREATED', actorType: 'USER', actorId, resourceType: 'REPORT', resourceId: firstId });
  await AuditLog.create({ category: 'REPORT', action: 'REPORT_UPDATED', actorType: 'USER', actorId, resourceType: 'REPORT', resourceId: firstId });
  await AuditLog.create({ category: 'REPORT', action: 'REPORT_CREATED', actorType: 'USER', actorId, resourceType: 'REPORT', resourceId: secondId });
  const result = await support.get(`/api/admin/reports/${firstId}/logs`).expect(200);
  expect(result.body.logs.map((log: { action: string }) => log.action)).toEqual(['REPORT_UPDATED', 'REPORT_CREATED']);
  expect(result.body.logs.every((log: { resourceId: string }) => log.resourceId === firstId)).toBe(true);
  expect(result.body.logs[0].actorId.email).toBe('history@example.com');
  expect(result.body.logs.some((log: { resourceId: string }) => log.resourceId === secondId)).toBe(false);
  await support.get('/api/admin/reports/invalid/logs').expect(400);
});

test('login, refresh, logout, and session lifecycle record security events without secrets', async () => {
  const agent = await register('security@example.com');
  await agent.post('/api/auth/login').send({ email: 'security@example.com', password: 'wrong-password' }).expect(401);
  const login = await agent.post('/api/auth/login').send({ email: 'security@example.com', password }).expect(200);
  const oldCookies = login.headers['set-cookie'] as string[];
  await agent.post('/api/auth/refresh').expect(200);
  await request(app).post('/api/auth/refresh').set('Cookie', oldCookies).expect(401);
  await agent.post('/api/auth/logout').expect(204);

  const actions = (await AuditLog.find({ category: 'SECURITY' })).map((log) => log.action);
  expect(actions).toEqual(expect.arrayContaining([
    'SESSION_CREATED', 'AUTH_LOGIN_FAILURE', 'AUTH_LOGIN_SUCCESS', 'AUTH_REFRESH_SUCCESS',
    'AUTH_REFRESH_FAILURE', 'AUTH_LOGOUT', 'SESSION_TERMINATED'
  ]));
  expect(await AuditLog.countDocuments({ action: 'SESSION_CREATED' })).toBe(2);
  expect((await AuditLog.findOne({ action: 'AUTH_LOGIN_FAILURE' }))?.metadata).toEqual(expect.objectContaining({
    attemptedEmail: 'security@example.com', reason: 'INVALID_CREDENTIALS'
  }));
  expect((await AuditLog.findOne({ action: 'AUTH_REFRESH_SUCCESS' }))?.metadata).toEqual(expect.objectContaining({ rotated: true }));
  const stored = JSON.stringify(await AuditLog.find().lean());
  expect(stored).not.toContain(password);
  expect(stored).not.toContain('wrong-password');
  for (const cookie of oldCookies) expect(stored).not.toContain(cookie.split(';')[0].split('=')[1]);
  expect(stored).not.toContain('refreshTokenHash');
});

test('logout-all terminates each persisted session and an explicitly expired session is audited', async () => {
  const first = await register('sessions@example.com');
  const second = request.agent(app);
  await second.post('/api/auth/login').send({ email: 'sessions@example.com', password }).expect(200);
  await first.post('/api/auth/logout-all').expect(204);
  expect(await AuditLog.countDocuments({ action: 'SESSION_TERMINATED', 'metadata.reason': 'LOGOUT_ALL' })).toBe(2);
  await second.post('/api/auth/refresh').expect(401);

  const third = request.agent(app);
  await third.post('/api/auth/login').send({ email: 'sessions@example.com', password }).expect(200);
  const active = await Session.findOne({ revokedAt: { $exists: false } }).sort('-createdAt');
  await Session.collection.updateOne({ _id: active!._id }, { $set: { expiresAt: new Date(Date.now() - 1000) } });
  await third.post('/api/auth/refresh').expect(401);
  expect(await AuditLog.countDocuments({ action: 'SESSION_EXPIRED', sessionId: active!.id })).toBe(1);
  expect((await AuditLog.findOne({ action: 'AUTH_REFRESH_FAILURE', sessionId: active!.id }))?.metadata).toEqual({ reason: 'SESSION_EXPIRED' });
});

test('authorization denials are logged and global filters, search, and date order work', async () => {
  const owner = await register('filter-owner@example.com');
  const reportId = await createReport(owner);
  expect(await AuditLog.countDocuments({ category: 'REPORT' })).toBe(0);
  await AuditLog.create({
    category: 'REPORT', action: 'REPORT_CREATED', actorType: 'USER',
    actorId: (await User.findOne({ email: 'filter-owner@example.com' }))!.id,
    resourceType: 'REPORT', resourceId: reportId
  });
  await request(app).post('/api/auth/login').send({ email: 'attempted@example.com', password: 'invalid-password' }).expect(401);
  await owner.get('/api/admin/logs').expect(403);
  const other = await register('filter-other@example.com');
  await other.patch(`/api/reports/${reportId}`).send({ reason: 'OTHER', description: 'No access.', status: 'OPEN' }).expect(404);
  const support = await admin('filter-admin@example.com');

  const denied = await AuditLog.find({ action: 'AUTHORIZATION_DENIED' });
  expect(denied).toHaveLength(2);
  expect(denied.some((log) => log.metadata.route === '/api/admin/logs')).toBe(true);
  expect(denied.some((log) => log.resourceType === 'REPORT' && log.resourceId?.toString() === reportId)).toBe(true);
  await owner.get('/api/admin/logs').expect(403);

  const reportOnly = await support.get('/api/admin/logs?category=REPORT').expect(200);
  expect(reportOnly.body.logs.every((log: { category: string }) => log.category === 'REPORT')).toBe(true);
  const securityOnly = await support.get('/api/admin/logs?category=SECURITY').expect(200);
  expect(securityOnly.body.logs.every((log: { category: string }) => log.category === 'SECURITY')).toBe(true);
  const byAction = await support.get('/api/admin/logs?action=REPORT_CREATED').expect(200);
  expect(byAction.body.logs).toHaveLength(1);
  const byActor = await support.get('/api/admin/logs?actorType=ANONYMOUS').expect(200);
  expect(byActor.body.logs.length).toBeGreaterThan(0);
  expect(byActor.body.logs.every((log: { actorType: string }) => log.actorType === 'ANONYMOUS')).toBe(true);
  const byResource = await support.get('/api/admin/logs?resourceType=REPORT').expect(200);
  expect(byResource.body.logs.every((log: { resourceType: string }) => log.resourceType === 'REPORT')).toBe(true);
  const byEmail = await support.get('/api/admin/logs?search=filter-owner@example.com').expect(200);
  expect(byEmail.body.logs.some((log: { action: string }) => log.action === 'REPORT_CREATED')).toBe(true);
  const byAttempt = await support.get('/api/admin/logs?search=attempted@example.com').expect(200);
  expect(byAttempt.body.logs.some((log: { action: string }) => log.action === 'AUTH_LOGIN_FAILURE')).toBe(true);
  const byId = await support.get(`/api/admin/logs?search=${reportId}`).expect(200);
  expect(byId.body.logs.some((log: { resourceId: string }) => log.resourceId === reportId)).toBe(true);
  const ascending = await support.get('/api/admin/logs?order=asc&limit=100').expect(200);
  const descending = await support.get('/api/admin/logs?order=desc&limit=100').expect(200);
  expect(ascending.body.logs.map((log: { _id: string }) => log._id)).toEqual(descending.body.logs.map((log: { _id: string }) => log._id).reverse());
});

test.skip('an audit write failure leaves the Report persisted and the request successful', async () => {
  const owner = await register('failure@example.com');
  const create = jest.spyOn(AuditLog, 'create').mockRejectedValueOnce(new Error('Database unavailable'));
  const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  try {
    const reportId = await createReport(owner);
    expect(await Report.exists({ _id: reportId })).not.toBeNull();
    expect(error).toHaveBeenCalledWith('Could not record audit log: REPORT_CREATED');
  } finally {
    create.mockRestore();
    error.mockRestore();
  }
});

test('audit write failures do not block login or refresh', async () => {
  await register('auth-failure@example.com');
  const agent = request.agent(app);
  const create = jest.spyOn(AuditLog, 'create').mockRejectedValue(new Error('Database unavailable'));
  const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  try {
    await agent.post('/api/auth/login').send({ email: 'auth-failure@example.com', password }).expect(200);
    await agent.post('/api/auth/refresh').expect(200);
    expect(error).toHaveBeenCalledWith('Could not record audit log: AUTH_LOGIN_SUCCESS');
    expect(error).toHaveBeenCalledWith('Could not record audit log: AUTH_REFRESH_SUCCESS');
  } finally {
    create.mockRestore();
    error.mockRestore();
  }
});
