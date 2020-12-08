// Copyright (C) 2020 Inderjit Gill <email@indy.io>

// This file is part of Memo

// Memo is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Memo is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

use super::pg;
use crate::error::Result;
use crate::interop::categories as interop_categories;
use crate::interop::notes as interop;
use crate::interop::Key;
use deadpool_postgres::Pool;
use serde::{Deserialize, Serialize};
use tokio_pg_mapper_derive::PostgresMapper;

#[allow(unused_imports)]
use tracing::info;

#[derive(Debug, Deserialize, PostgresMapper, Serialize)]
#[pg_mapper(table = "notes")]
struct Note {
    id: Key,
    title: String,
    content: String,
    triaged_at: Option<chrono::DateTime<chrono::Utc>>,
    category_id: Option<Key>,
}

//  pub created_at: chrono::DateTime<chrono::Utc>,

#[derive(Debug, Deserialize, PostgresMapper, Serialize)]
#[pg_mapper(table = "notes")]
pub struct NoteId {
    pub id: Key,
}

impl From<Note> for interop::Note {
    fn from(n: Note) -> interop::Note {
        interop::Note {
            id: n.id,
            title: n.title,
            content: n.content,
        }
    }
}

impl From<Note> for interop::TriagedNote {
    fn from(n: Note) -> interop::TriagedNote {
        interop::TriagedNote {
            id: n.id,
            title: n.title,
            content: n.content,
            triaged_at: n.triaged_at.expect("triaged_at is required"),
            category_id: n.category_id.expect("category_id is required"),
        }
    }
}

pub(crate) async fn create(
    db_pool: &Pool,
    user_id: Key,
    note: &interop::ProtoNote,
) -> Result<interop::Note> {
    pg::one_from::<Note, interop::Note>(
        db_pool,
        "INSERT INTO notes(user_id, title, content)
         VALUES ($1, $2, $3)
         RETURNING $table_fields",
        &[&user_id, &note.title, &note.content]
    )
    .await
}

pub(crate) async fn all_non_triaged(db_pool: &Pool, user_id: Key) -> Result<Vec<interop::Note>> {
    pg::many_from::<Note, interop::Note>(
        db_pool,
        "SELECT n.id,
                n.title,
                n.content,
                n.triaged_at,
                n.category_id
         FROM   notes n
         WHERE  n.user_id = $1 and n.triaged_at is null and n.deleted_at is null
         ORDER BY n.id desc",
        &[&user_id]
    )
    .await
}

pub(crate) async fn all_binned(db_pool: &Pool, user_id: Key) -> Result<Vec<interop::Note>> {
    pg::many_from::<Note, interop::Note>(
        db_pool,
        "SELECT n.id,
                n.title,
                n.content,
                n.triaged_at,
                n.category_id
         FROM   notes n
         WHERE  n.user_id = $1 and n.deleted_at is not null
         ORDER BY n.deleted_at desc",
        &[&user_id],
    )
    .await
}

pub(crate) async fn triaged_all(db_pool: &Pool, user_id: Key) -> Result<Vec<interop::TriagedNote>> {
    pg::many_from::<Note, interop::TriagedNote>(
        db_pool,
        "SELECT n.id,
                n.title,
                n.content,
                n.triaged_at,
                n.category_id
         FROM   notes n
         WHERE  n.user_id = $1 and n.triaged_at is not null and n.deleted_at is null
         ORDER BY n.id desc",
        &[&user_id],
    )
    .await
}

/// note: get and triaged_get are the same query

pub(crate) async fn get(db_pool: &Pool, user_id: Key, note_id: Key) -> Result<interop::Note> {
    pg::one_from::<Note, interop::Note>(
        db_pool,
        "SELECT n.id,
                n.title,
                n.content,
                n.triaged_at,
                n.category_id
         FROM notes n
         WHERE n.id = $2 AND n.user_id = $1",
        &[&user_id, &note_id],
    )
    .await
}

pub(crate) async fn triaged_get(
    db_pool: &Pool,
    user_id: Key,
    note_id: Key,
) -> Result<interop::TriagedNote> {
    pg::one_from::<Note, interop::TriagedNote>(
        db_pool,
        "SELECT n.id,
                n.title,
                n.content,
                n.triaged_at,
                n.category_id
        FROM notes n
        WHERE n.id = $2 AND n.user_id = $1",
        &[&user_id, &note_id],
    )
    .await
}

pub(crate) async fn triage(
    db_pool: &Pool,
    user_id: Key,
    note_id: Key,
    category: interop_categories::Category,
) -> Result<interop::TriagedNote> {
    pg::one_from::<Note, interop::TriagedNote>(
        db_pool,
        "UPDATE notes
         SET triaged_at = now(), category_id = $3
         WHERE id = $2 and user_id = $1
         RETURNING $table_fields",
        &[&user_id, &note_id, &category.id],
    )
    .await
}

pub(crate) async fn untriage(db_pool: &Pool, user_id: Key, note_id: Key) -> Result<interop::Note> {
    pg::one_from::<Note, interop::Note>(
        db_pool,
        "UPDATE notes
         SET triaged_at = null, category_id = null
         WHERE id = $2 and user_id = $1
         RETURNING $table_fields",
        &[&user_id, &note_id],
    )
    .await
}

pub(crate) async fn bin(db_pool: &Pool, user_id: Key, note_id: Key) -> Result<interop::Note> {
    pg::one_from::<Note, interop::Note>(
        db_pool,
        "UPDATE notes
         SET deleted_at = now()
         WHERE id = $2 and user_id = $1
         RETURNING $table_fields",
        &[&user_id, &note_id],
    )
    .await
}

pub(crate) async fn edit(
    db_pool: &Pool,
    user_id: Key,
    note: &interop::ProtoNote,
    note_id: Key,
) -> Result<interop::Note> {
    pg::one_from::<Note, interop::Note>(
        db_pool,
        "UPDATE notes
         SET title = $3, content = $4
         WHERE id = $2 and user_id = $1
         RETURNING $table_fields",
        &[&user_id, &note_id, &note.title, &note.content],
    )
    .await
}

pub(crate) async fn unbin(db_pool: &Pool, user_id: Key, note_id: Key) -> Result<interop::Note> {
    pg::one_from::<Note, interop::Note>(
        db_pool,
        "UPDATE notes
         SET deleted_at = null
         WHERE id = $2 and user_id = $1
         RETURNING $table_fields",
        &[&user_id, &note_id],
    )
    .await
}

pub(crate) async fn delete(db_pool: &Pool, user_id: Key, id: Key) -> Result<()> {
    pg::zero_from(
        db_pool,
        "DELETE FROM notes
         WHERE id = $2 AND user_id = $1",
        &[&user_id, &id],
    )
    .await
}

pub(crate) async fn delete_all(db_pool: &Pool, user_id: Key) -> Result<()> {
    pg::zero_from(
        db_pool,
        "DELETE FROM notes
         WHERE user_id = $1 AND deleted_at is not null",
        &[&user_id],
    )
    .await
}
