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

use crate::db::sqlite::{many, one, zero, FromRow, SqlitePool};
use crate::interop::categories as interop_categories;
use crate::interop::notes as interop;
use crate::interop::Key;

use rusqlite::{params, Row};

#[allow(unused_imports)]
use tracing::info;

impl FromRow for interop::Note {
    fn from_row(row: &Row) -> crate::Result<interop::Note> {
        Ok(interop::Note {
            id: row.get(0)?,
            title: row.get(1)?,
            content: row.get(2)?,
            triaged_at: row.get(3).ok(),
            category_id: row.get(4).ok(),
            pinned: row.get(5)?,
            created_at: row.get(6)?,
        })
    }
}

pub(crate) fn create(
    db_pool: &SqlitePool,
    user_id: Key,
    note: &interop::ProtoNote,
) -> crate::Result<interop::Note> {
    let conn = db_pool.get()?;

    if let Some(category_id) = note.category_id {
        one(
            &conn,
            "
               INSERT INTO notes (user_id, title, content, category_id, triaged_at)
               VALUES(?1, ?2, ?3, ?4, datetime())
               RETURNING id, title, content, triaged_at, category_id, pinned, created_at
            ",
            params![user_id, &note.title, &note.content, &category_id],
        )
    } else {
        one(
            &conn,
            "
               INSERT INTO notes (user_id, title, content)
               VALUES(?1, ?2, ?3)
               RETURNING id, title, content, triaged_at, category_id, pinned, created_at
            ",
            params![user_id, &note.title, &note.content],
        )
    }
}

pub(crate) fn all_non_triaged(
    db_pool: &SqlitePool,
    user_id: Key,
) -> crate::Result<Vec<interop::Note>> {
    let conn = db_pool.get()?;

    many(
        &conn,
        "SELECT id,
                title,
                content,
                triaged_at,
                category_id,
                pinned,
                created_at
         FROM   notes
         WHERE  user_id = ?1 and triaged_at is null and deleted_at is null
         ORDER BY id DESC",
        params![user_id],
    )
}

pub(crate) fn all_binned(db_pool: &SqlitePool, user_id: Key) -> crate::Result<Vec<interop::Note>> {
    let conn = db_pool.get()?;

    many(
        &conn,
        "SELECT id,
                title,
                content,
                triaged_at,
                category_id,
                pinned,
                created_at
         FROM   notes
         WHERE  user_id = ?1 and deleted_at is not null
         ORDER BY deleted_at DESC",
        params![&user_id],
    )
}

pub(crate) fn get_category(
    db_pool: &SqlitePool,
    user_id: Key,
    category_id: Key,
) -> crate::Result<Vec<interop::Note>> {
    let conn = db_pool.get()?;

    many(
        &conn,
        "SELECT id,
                title,
                content,
                triaged_at,
                category_id,
                pinned,
                created_at
         FROM   notes
         WHERE  user_id = ?1 and category_id = ?2 and triaged_at is not null and deleted_at is null
         ORDER BY id desc",
        params![&user_id, &category_id],
    )
}

/// note: get and triaged_get are the same query

pub(crate) fn get(
    db_pool: &SqlitePool,
    user_id: Key,
    note_id: Key,
) -> crate::Result<interop::Note> {
    let conn = db_pool.get()?;

    one(
        &conn,
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
    )
}

pub(crate) fn triage(
    db_pool: &SqlitePool,
    user_id: Key,
    note_id: Key,
    category: interop_categories::Category,
) -> crate::Result<interop::Note> {
    // paranoid wrap in a transaction because if there's anything wrong with
    // the UPDATE it might succeed and the subsequent SELECT may end up failing

    let mut conn = db_pool.get()?;
    let tx = conn.transaction()?;

    zero(
        &tx,
        r#"UPDATE notes
         SET triaged_at = datetime(), category_id = ?3
         WHERE id = ?2 and user_id = ?1"#,
        params![&user_id, &note_id, &category.id],
    )?;
    let res = one(
        &tx,
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
    )?;

    tx.commit()?;

    Ok(res)
}

pub(crate) fn untriage(
    db_pool: &SqlitePool,
    user_id: Key,
    note_id: Key,
) -> crate::Result<interop::Note> {
    let conn = db_pool.get()?;
    zero(
        &conn,
        "UPDATE notes
         SET triaged_at = null, category_id = null
         WHERE id = ?2 and user_id = ?1",
        params![&user_id, &note_id],
    )?;
    get(db_pool, user_id, note_id)
}

pub(crate) fn bin(
    db_pool: &SqlitePool,
    user_id: Key,
    note_id: Key,
) -> crate::Result<interop::Note> {
    let conn = db_pool.get()?;
    zero(
        &conn,
        "UPDATE notes
         SET deleted_at = datetime()
         WHERE id = ?2 and user_id = ?1",
        params![&user_id, &note_id],
    )?;
    get(db_pool, user_id, note_id)
}

pub(crate) fn edit(
    db_pool: &SqlitePool,
    user_id: Key,
    note: &interop::ProtoNote,
    note_id: Key,
) -> crate::Result<interop::Note> {
    let conn = db_pool.get()?;
    zero(
        &conn,
        "UPDATE notes
         SET title = ?3, content = ?4, pinned = ?5
         WHERE id = ?2 and user_id = ?1",
        params![&user_id, &note_id, &note.title, &note.content, &note.pinned],
    )?;
    get(db_pool, user_id, note_id)
}

pub(crate) fn unbin(
    db_pool: &SqlitePool,
    user_id: Key,
    note_id: Key,
) -> crate::Result<interop::Note> {
    let conn = db_pool.get()?;
    zero(
        &conn,
        "UPDATE notes
         SET deleted_at = null
         WHERE id = ?2 and user_id = ?1",
        &[&user_id, &note_id],
    )?;

    get(db_pool, user_id, note_id)
}

pub(crate) fn delete(db_pool: &SqlitePool, user_id: Key, id: Key) -> crate::Result<()> {
    let conn = db_pool.get()?;
    zero(
        &conn,
        "DELETE FROM notes
         WHERE id = ?2 AND user_id = ?1",
        params![&user_id, &id],
    )
}

pub(crate) fn delete_all_categorised(
    db_pool: &SqlitePool,
    user_id: Key,
    category_id: Key,
) -> crate::Result<()> {
    let conn = db_pool.get()?;
    zero(
        &conn,
        "DELETE FROM notes
         WHERE category_id = ?2 AND user_id = ?1",
        params![&user_id, &category_id],
    )
}

pub(crate) fn delete_all(db_pool: &SqlitePool, user_id: Key) -> crate::Result<()> {
    let conn = db_pool.get()?;
    zero(
        &conn,
        "DELETE FROM notes
         WHERE user_id = ?1 AND deleted_at is not null",
        params![&user_id],
    )
}
