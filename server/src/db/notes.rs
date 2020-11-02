// Copyright (C) 2020 Inderjit Gill <email@indy.io>

// This file is part of Civil

// Civil is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Civil is distributed in the hope that it will be useful,
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
}

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

pub(crate) async fn all(db_pool: &Pool, user_id: Key) -> Result<Vec<interop::Note>> {
    pg::many_from::<Note, interop::Note>(
        db_pool,
        include_str!("sql/notes_all.sql"),
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
