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
use crate::interop::categories as interop;
use crate::interop::Key;
use rusqlite::{params, Row};

fn from_row(row: &Row) -> Result<interop::Category> {
    Ok(interop::Category {
        id: row.get(0)?,
        title: row.get(1)?,
    })
}

// note: this returns an array of all the user's categories rather
// than the standard REST thing of the newly created category only
// (client requires a list of all the categories for the UI)
//
pub(crate) fn create(
    db_pool: &SqlitePool,
    user_id: Key,
    category: &interop::ProtoCategory,
) -> Result<Vec<interop::Category>> {
    let conn = db_pool.get()?;
    zero(
        &conn,
        r#"
               insert into categories (user_id, title)
               values(?1, ?2)
            "#,
        params![user_id, category.title],
    )?;

    all(db_pool, user_id)
}

pub(crate) fn all(db_pool: &SqlitePool, user_id: Key) -> Result<Vec<interop::Category>> {
    let conn = db_pool.get()?;
    many::<interop::Category>(
        &conn,
        r#"
           SELECT id, title
           FROM categories
           WHERE user_id = ?1
           ORDER BY title COLLATE NOCASE ASC
        "#,
        params![user_id],
        from_row,
    )
}

pub(crate) fn get(
    db_pool: &SqlitePool,
    user_id: Key,
    category_id: Key,
) -> Result<interop::Category> {
    let conn = db_pool.get()?;
    one::<interop::Category>(
        &conn,
        r#"
           select id, title
           from categories
           where user_id = ?1 and id = ?2
        "#,
        params![user_id, category_id],
        from_row,
    )
}

pub(crate) fn edit(
    db_pool: &SqlitePool,
    user_id: Key,
    category: &interop::ProtoCategory,
    category_id: Key,
) -> Result<interop::Category> {
    let conn = db_pool.get()?;
    zero(
        &conn,
        r#"
           update categories
           set title = ?1 where user_id = ?2 and id = ?3
        "#,
        params![category.title, user_id, category_id],
    )?;
    get(db_pool, user_id, category_id)
}

pub(crate) fn delete(db_pool: &SqlitePool, user_id: Key, id: Key) -> Result<()> {
    let conn = db_pool.get()?;
    zero(
        &conn,
        r#"
           delete
           from categories
           where user_id = ?1 and id = ?2
        "#,
        params![user_id, id],
    )
}
