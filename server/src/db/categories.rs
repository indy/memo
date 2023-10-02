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

use crate::db::notes as db_notes;
use crate::db::sqlite::{many, one, zero, FromRow, SqlitePool};
use crate::interop::categories as interop;
use crate::interop::Key;
use rusqlite::{params, Row};

impl FromRow for interop::Category {
    fn from_row(row: &Row) -> crate::Result<interop::Category> {
        Ok(interop::Category {
            id: row.get(0)?,
            title: row.get(1)?,
        })
    }
}

// note: this returns an array of all the user's categories rather
// than the standard REST thing of the newly created category only
// (client requires a list of all the categories for the UI)
//
pub(crate) fn create(
    db_pool: &SqlitePool,
    user_id: Key,
    category: &interop::ProtoCategory,
) -> crate::Result<Vec<interop::Category>> {
    let conn = db_pool.get()?;
    zero(
        &conn,
        "insert into categories (user_id, title) values(?1, ?2)",
        params![user_id, category.title],
    )?;

    all(db_pool, user_id)
}

pub(crate) fn all(db_pool: &SqlitePool, user_id: Key) -> crate::Result<Vec<interop::Category>> {
    let conn = db_pool.get()?;
    let stmt = "SELECT id, title
                FROM categories
                WHERE user_id = ?1
                ORDER BY title COLLATE NOCASE ASC";
    many(&conn, stmt, params![user_id])
}

pub(crate) fn get(
    db_pool: &SqlitePool,
    user_id: Key,
    category_id: Key,
) -> crate::Result<interop::Category> {
    let conn = db_pool.get()?;
    let stmt = "SELECT id, title
                FROM categories
                WHERE user_id = ?1 AND id = ?2";
    one(&conn, stmt, params![user_id, category_id])
}

pub(crate) fn edit(
    db_pool: &SqlitePool,
    user_id: Key,
    category: &interop::ProtoCategory,
    category_id: Key,
) -> crate::Result<interop::Category> {
    let conn = db_pool.get()?;
    let stmt = "UPDATE categories
                SET title = ?1 WHERE user_id = ?2 AND id = ?3";
    zero(&conn, stmt, params![category.title, user_id, category_id])?;
    get(db_pool, user_id, category_id)
}

pub(crate) fn delete(db_pool: &SqlitePool, user_id: Key, id: Key) -> crate::Result<()> {
    db_notes::delete_all_categorised(db_pool, user_id, id)?;

    let conn = db_pool.get()?;
    let stmt = "DELETE
                FROM categories
                WHERE user_id = ?1 AND id = ?2";
    zero(&conn, stmt, params![user_id, id])
}
