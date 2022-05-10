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

use crate::db::sqlite::{many, one, zero, SqlitePool};
use crate::error::Result;
use crate::interop::categories as interop_categories;
use crate::interop::notes as interop;
use crate::interop::Key;

use rusqlite::{params, Row};

#[allow(unused_imports)]
use tracing::info;

fn from_row(row: &Row) -> Result<interop::Note> {
    Ok(interop::Note {
        id: row.get(0)?,
        title: row.get(1)?,
        content: row.get(2)?,
        pinned: row.get(3)?,
        created_at: row.get(4)?,
    })
}

fn triaged_from_row(row: &Row) -> Result<interop::TriagedNote> {
    Ok(interop::TriagedNote {
        id: row.get(0)?,
        title: row.get(1)?,
        content: row.get(2)?,
        triaged_at: row.get(3)?,
        category_id: row.get(4)?,
        pinned: row.get(5)?,
        created_at: row.get(6)?,
    })
}

pub(crate) fn create(
    db_pool: &SqlitePool,
    user_id: Key,
    note: &interop::ProtoNote,
) -> Result<interop::Note> {
    zero(
        db_pool,
        r#"
               insert into notes (user_id, title, content)
               values(?1, ?2, ?3)
            "#,
        params![user_id, &note.title, &note.content],
    )?;

    one::<interop::Note>(
        db_pool,
        r#"
               select id, title, content, pinned, created_at
               from notes
               where user_id = ?1 and content = ?2
            "#,
        params![user_id, &note.content],
        from_row,
    )
}

pub(crate) fn all_non_triaged(db_pool: &SqlitePool, user_id: Key) -> Result<Vec<interop::Note>> {
    many::<interop::Note>(
        db_pool,
        "SELECT id,
                title,
                content,
                pinned,
                created_at
         FROM   notes
         WHERE  user_id = ?1 and triaged_at is null and deleted_at is null
         ORDER BY id DESC",
        params![user_id],
        from_row,
    )
}

pub(crate) fn all_binned(db_pool: &SqlitePool, user_id: Key) -> Result<Vec<interop::Note>> {
    many::<interop::Note>(
        db_pool,
        "SELECT id,
                title,
                content,
                pinned,
                created_at
         FROM   notes
         WHERE  user_id = ?1 and deleted_at is not null
         ORDER BY deleted_at DESC",
        params![&user_id],
        from_row,
    )
}

pub(crate) fn triaged_all(db_pool: &SqlitePool, user_id: Key) -> Result<Vec<interop::TriagedNote>> {
    many::<interop::TriagedNote>(
        db_pool,
        "SELECT id,
                title,
                content,
                triaged_at,
                category_id,
                pinned,
                created_at
         FROM   notes
         WHERE  user_id = ?1 and triaged_at is not null and deleted_at is null
         ORDER BY id desc",
        params![&user_id],
        triaged_from_row,
    )
}

/// note: get and triaged_get are the same query

pub(crate) fn get(db_pool: &SqlitePool, user_id: Key, note_id: Key) -> Result<interop::Note> {
    one::<interop::Note>(
        db_pool,
        "SELECT id,
                title,
                content,
                pinned,
                created_at
         FROM notes
         WHERE id = ?2 AND user_id = ?1",
        params![&user_id, &note_id],
        from_row,
    )
}

pub(crate) fn triaged_get(
    db_pool: &SqlitePool,
    user_id: Key,
    note_id: Key,
) -> Result<interop::TriagedNote> {
    one::<interop::TriagedNote>(
        db_pool,
        "SELECT id,
                title,
                content,
                triaged_at,
                category_id,
                pinned,
                created_at
        FROM notes
        WHERE id = ?2 AND user_id = ?1",
        params![&user_id, &note_id],
        triaged_from_row,
    )
}

pub(crate) fn triage(
    db_pool: &SqlitePool,
    user_id: Key,
    note_id: Key,
    category: interop_categories::Category,
) -> Result<interop::TriagedNote> {
    zero(
        db_pool,
        r#"UPDATE notes
         SET triaged_at = datetime(), category_id = ?3
         WHERE id = ?2 and user_id = ?1"#,
        params![&user_id, &note_id, &category.id],
    )?;
    triaged_get(db_pool, user_id, note_id)
}

pub(crate) fn untriage(db_pool: &SqlitePool, user_id: Key, note_id: Key) -> Result<interop::Note> {
    zero(
        db_pool,
        "UPDATE notes
         SET triaged_at = null, category_id = null
         WHERE id = ?2 and user_id = ?1",
        params![&user_id, &note_id],
    )?;
    get(db_pool, user_id, note_id)
}

pub(crate) fn bin(db_pool: &SqlitePool, user_id: Key, note_id: Key) -> Result<interop::Note> {
    zero(
        db_pool,
        r#"UPDATE notes
         SET deleted_at = datetime()
         WHERE id = ?2 and user_id = ?1"#,
        params![&user_id, &note_id],
    )?;
    get(db_pool, user_id, note_id)
}

pub(crate) fn edit(
    db_pool: &SqlitePool,
    user_id: Key,
    note: &interop::ProtoNote,
    note_id: Key,
) -> Result<interop::Note> {
    zero(
        db_pool,
        "UPDATE notes
         SET title = ?3, content = ?4, pinned = ?5
         WHERE id = ?2 and user_id = ?1",
        params![&user_id, &note_id, &note.title, &note.content, &note.pinned],
    )?;
    get(db_pool, user_id, note_id)
}

pub(crate) fn unbin(db_pool: &SqlitePool, user_id: Key, note_id: Key) -> Result<interop::Note> {
    zero(
        db_pool,
        "UPDATE notes
         SET deleted_at = null
         WHERE id = ?2 and user_id = ?1",
        &[&user_id, &note_id],
    )?;

    get(db_pool, user_id, note_id)
}

pub(crate) fn delete(db_pool: &SqlitePool, user_id: Key, id: Key) -> Result<()> {
    zero(
        db_pool,
        "DELETE FROM notes
         WHERE id = ?2 AND user_id = ?1",
        params![&user_id, &id],
    )
}

pub(crate) fn delete_all(db_pool: &SqlitePool, user_id: Key) -> Result<()> {
    zero(
        db_pool,
        "DELETE FROM notes
         WHERE user_id = ?1 AND deleted_at is not null",
        params![&user_id],
    )
}
