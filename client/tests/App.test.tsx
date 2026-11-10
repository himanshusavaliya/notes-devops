import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as api from '../src/api';
import type { Note } from '../src/api';
import { App } from '../src/App';

// Replace the real API module, so these tests never touch the network.
vi.mock('../src/api');

function makeNote(id: string, title: string, body = ''): Note {
  const now = '2026-01-01T00:00:00.000Z';

  return {
    id,
    title,
    body,
    createdAt: now,
    updatedAt: now,
  };
}

describe('App', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(api.listNotes).mockResolvedValue([]);
  });

  it('loads and shows the existing notes', async () => {
    vi.mocked(api.listNotes).mockResolvedValue([makeNote('1', 'Milk')]);

    render(<App />);

    expect(
      await screen.findByRole('heading', { name: 'Milk' })
    ).toBeInTheDocument();
  });

  it('adds a new note to the list', async () => {
    const user = userEvent.setup();

    vi.mocked(api.createNote).mockResolvedValue(makeNote('2', 'Bread'));

    render(<App />);

    await screen.findByText(/No notes yet/);

    await user.type(screen.getByLabelText('Title'), 'Bread');

    await user.click(screen.getByRole('button', { name: 'Add note' }));

    expect(api.createNote).toHaveBeenCalledWith({
      title: 'Bread',
      body: '',
    });

    expect(
      await screen.findByRole('heading', { name: 'Bread' })
    ).toBeInTheDocument();
  });

  it('edits a note', async () => {
    const user = userEvent.setup();

    vi.mocked(api.listNotes).mockResolvedValue([
      makeNote('1', 'Milk', 'Two pints'),
    ]);

    vi.mocked(api.updateNote).mockResolvedValue(
      makeNote('1', 'Fresh Milk', 'Three pints')
    );

    render(<App />);

    await screen.findByRole('heading', { name: 'Milk' });

    // Click Edit.
    await user.click(screen.getByRole('button', { name: /Edit/i }));

    // Check existing values.
    expect(screen.getByLabelText('Title')).toHaveValue('Milk');
    expect(screen.getByLabelText('Body')).toHaveValue('Two pints');

    // Update title.
    await user.clear(screen.getByLabelText('Title'));
    await user.type(screen.getByLabelText('Title'), 'Fresh Milk');

    // Update body.
    await user.clear(screen.getByLabelText('Body'));
    await user.type(screen.getByLabelText('Body'), 'Three pints');

    // Click Save changes.
    await user.click(screen.getByRole('button', { name: /Save changes/i }));

    // Check API call.
    expect(api.updateNote).toHaveBeenCalledWith('1', {
      title: 'Fresh Milk',
      body: 'Three pints',
    });

    // Check updated note.
    expect(
      await screen.findByRole('heading', { name: 'Fresh Milk' })
    ).toBeInTheDocument();
  });

  it('removes a deleted note from the list', async () => {
    const user = userEvent.setup();

    vi.mocked(api.listNotes).mockResolvedValue([makeNote('1', 'Milk')]);

    vi.mocked(api.deleteNote).mockResolvedValue(undefined);

    render(<App />);

    await screen.findByRole('heading', { name: 'Milk' });

    await user.click(screen.getByRole('button', { name: /Delete/i }));

    expect(api.deleteNote).toHaveBeenCalledWith('1');

    expect(await screen.findByText(/No notes yet/)).toBeInTheDocument();
  });

  it('shows an error when the notes cannot be loaded', async () => {
    vi.mocked(api.listNotes).mockRejectedValue(
      new Error('Failed to load notes')
    );

    render(<App />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /Failed to load notes/i
    );
  });
});
