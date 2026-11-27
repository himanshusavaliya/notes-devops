import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app.js';
import { InMemoryNoteRepository } from '../../src/repositories/InMemoryNoteRepository.js';

describe('notes API', () => {
  let app: ReturnType<typeof createApp>;

  // Create a fresh app and repository before each test
  beforeEach(() => {
    app = createApp(new InMemoryNoteRepository());
  });

  it('reports that the service is healthy', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  it('returns an empty list before any note exists', async () => {
    const response = await request(app).get('/api/notes');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it('creates a note and returns it with 201', async () => {
    const response = await request(app)
      .post('/api/notes')
      .send({ title: 'Milk', body: 'Two pints' });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      title: 'Milk',
      body: 'Two pints',
    });
    expect(response.body.id).toEqual(expect.any(String));
  });

  it('lists a note after it has been created', async () => {
    await request(app).post('/api/notes').send({ title: 'Milk' });

    const response = await request(app).get('/api/notes');

    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toBe('Milk');
  });

  it('rejects a note without a title with 400', async () => {
    const response = await request(app).post('/api/notes').send({ body: 'x' });

    expect(response.status).toBe(400);
    expect(response.body.errors).toContain('Title is required');
  });

  it('rejects a body that is not valid JSON with 400', async () => {
    const response = await request(app)
      .post('/api/notes')
      .set('Content-Type', 'application/json')
      .send('{"title": ');

    expect(response.status).toBe(400);
  });

  it('updates a note', async () => {
    const created = await request(app)
      .post('/api/notes')
      .send({ title: 'Milk', body: 'One pint' });

    const noteId = created.body.id;

    const response = await request(app)
      .put(`/api/notes/${noteId}`)
      .send({ title: 'Bread', body: 'Two loaves' });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      title: 'Bread',
      body: 'Two loaves',
    });
    expect(response.body.id).toBe(noteId);
  });

  it('returns 404 when updating a note that does not exist', async () => {
    const response = await request(app)
      .put('/api/notes/non-existing-id')
      .send({ title: 'Bread', body: 'Two loaves' });

    expect(response.status).toBe(404);
  });

  it('returns 400 when updating a note with invalid data', async () => {
    const created = await request(app)
      .post('/api/notes')
      .send({ title: 'Milk', body: 'One pint' });

    const noteId = created.body.id;

    const response = await request(app)
      .put(`/api/notes/${noteId}`)
      .send({ body: 'Two pints' });

    expect(response.status).toBe(400);
    expect(response.body.errors).toContain('Title is required');
  });

  it('deletes a note', async () => {
    const created = await request(app)
      .post('/api/notes')
      .send({ title: 'Milk', body: 'One pint' });

    const noteId = created.body.id;

    const response = await request(app).delete(`/api/notes/${noteId}`);

    expect(response.status).toBe(204);

    const listResponse = await request(app).get('/api/notes');

    expect(listResponse.body).toHaveLength(0);
  });

  it('returns 404 when deleting a note that does not exist', async () => {
    const response = await request(app).delete('/api/notes/non-existing-id');

    expect(response.status).toBe(404);
  });

  it('returns a JSON 404 for an unknown API path', async () => {
    const response = await request(app).get('/api/unknown');

    expect(response.status).toBe(404);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.body).toBeDefined();
  });
});
