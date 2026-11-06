# Notes: user stories and story map

## Story map

The top row is the journey a user takes, left to right. Stories sit under the
activity they belong to. Everything above the release line is needed before
the product is worth showing to anybody.

| Capture       | Review        | Maintain       | Operate         |
| ------------- | ------------- | -------------- | --------------- |
| Create a note | List my notes | Edit a note    | Health endpoint |
|               |               | Delete a note  |                 |
| **Release 1** | **Release 1** | **Release 1**  | **Release 1**   |
|               | Search notes  | Pin a note     |                 |

## Stories

### 1. Create a note

As a user, I can create a note with a title and body, so that I do not have
to remember it.

Acceptance criteria:

- No more then 100 characters for title.
- Added unit tests covering successful note creation, validation failures,
  and edge cases such as empty input values.
- Given the title is empty, when I press Add note,
  then I am told a title is required and nothing is saved.

### 2. List my notes

As a user, I can see a list of my notes, so that I can find what I wrote.

Acceptance criteria:

- User can view all saved notes in a list.
- The list displays the title of each note.
- Notes are displayed when at least one note exists.

### 3. Edit a note

As a user, I can edit a note, so that I can correct or extend it.

Acceptance criteria:

- User can select an existing note to edit.
- The current title and body are displayed when editing a note.
- User can update the title and/or body of the note.

### 4. Delete a note

As a user, I can delete a note, so that the list only holds what I still need.

Acceptance criteria:

- User can select a note to delete.
- User is asked to confirm the deletion before the note is removed.
- The selected note is permanently removed from the notes list.



### 5. Health endpoint

As an operator, I can call a health endpoint, so that I can tell whether the
service is alive and which version is running.

Acceptance criteria:

- A health endpoint is available at /health.
- The endpoint returns HTTP status 200 OK when the service is running.
- The response includes the current application version.

### 6. note id 

As a user, I can view a note by its ID, so that I can read the full content of
 a specific note.

Acceptance criteria:

- Implemented a GET /notes/{id} endpoint to retrieve an
  individual note using its unique identifier.
- Added error handling for invalid and non-existent note IDs.
  The API now returns a 404 status when a note cannot be found.
- Created unit and integration tests to verify successful retrieval
  of notes and correct handling of missing records.

  ### 7. search note 

As a user, i can search notes by title, so that i can quickly find specific notes.

Acceptance criteria:

- Created a search endpoint allowing users to filter notes using a partial title 
 match.
- Search functionality is case-insensitive to improve usability and ensure 
 consistent results.
- Added unit tests covering exact matches, partial matches, and scenarios where
  no notes are found.

- `GET /api/health` returns status 200 with `status` equal to `ok`.
- The response includes the version of the running build.