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
use crate::error::{Error, Result};
use crate::interop::notes as interop;
use crate::interop::Key;
use deadpool_postgres::{Client, Pool};
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
    archived_at: Option<chrono::DateTime<chrono::Utc>>
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

impl From<Note> for interop::ArchivedNote {
    fn from(n: Note) -> interop::ArchivedNote {
        interop::ArchivedNote {
            id: n.id,
            title: n.title,
            content: n.content,
            archived_at: n.archived_at.expect("archived_at is required"),
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
        include_str!("sql/notes_create.sql"),
        &[&user_id, &note.title, &note.content],
    )
    .await
}

pub(crate) async fn all_active(db_pool: &Pool, user_id: Key) -> Result<Vec<interop::Note>> {
    pg::many_from::<Note, interop::Note>(
        db_pool,
        include_str!("sql/notes_all.sql"),
        &[&user_id],
    )
    .await
}

pub(crate) async fn all_archived(db_pool: &Pool, user_id: Key) -> Result<Vec<interop::ArchivedNote>> {
    pg::many_from::<Note, interop::ArchivedNote>(
        db_pool,
        include_str!("sql/archived_notes_all.sql"),
        &[&user_id],
    )
    .await
}

pub(crate) async fn get(db_pool: &Pool, user_id: Key, note_id: Key) -> Result<interop::Note> {
    pg::one_from::<Note, interop::Note>(
        db_pool,
        include_str!("sql/notes_get.sql"),
        &[&user_id, &note_id],
    )
    .await
}

pub(crate) async fn get_archived(db_pool: &Pool, user_id: Key, note_id: Key) -> Result<interop::ArchivedNote> {
    pg::one_from::<Note, interop::ArchivedNote>(
        db_pool,
        include_str!("sql/notes_get.sql"),
        &[&user_id, &note_id],
    )
    .await
}

pub(crate) async fn archive(db_pool: &Pool, user_id: Key, note_id: Key) -> Result<interop::ArchivedNote> {
    pg::one_from::<Note, interop::ArchivedNote>(
        db_pool,
        include_str!("sql/notes_archive.sql"),
        &[&user_id, &note_id],
    )
    .await
}

pub(crate) async fn edit(db_pool: &Pool, user_id: Key, note: &interop::ProtoNote, note_id: Key) -> Result<interop::Note> {
    pg::one_from::<Note, interop::Note>(
        db_pool,
        include_str!("sql/notes_edit.sql"),
        &[&user_id, &note_id, &note.title, &note.content],
    )
    .await
}


pub(crate) async fn delete(db_pool: &Pool, user_id: Key, id: Key) -> Result<()> {
    let mut client: Client = db_pool.get().await.map_err(Error::DeadPool)?;
    let tx = client.transaction().await?;

    pg::zero(
        &tx,
        &include_str!("sql/notes_delete.sql"),
        &[&user_id, &id],
    )
    .await?;

    tx.commit().await?;

    Ok(())
}
