// Copyright (C) 2022 Inderjit Gill <email@indy.io>

// This file is part of Memo

// Habit is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Habit is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

use crate::error::Result;
use rusqlite::{Row, ToSql};
#[allow(unused_imports)]
use tracing::info;

pub type SqlitePool = r2d2::Pool<r2d2_sqlite::SqliteConnectionManager>;

pub(crate) fn zero(db_pool: &SqlitePool, sql: &str, params: &[&dyn ToSql]) -> Result<()> {
    let conn = db_pool.get()?;
    conn.execute(sql, params)?;
    Ok(())
}

pub(crate) fn one<T>(
    db_pool: &SqlitePool,
    sql: &str,
    params: &[&dyn ToSql],
    from_row: fn(&Row) -> Result<T>,
) -> Result<T> {
    let conn = db_pool.get()?;
    let mut stmt = conn.prepare(sql)?;
    let mut rows = stmt.query(params)?;

    if let Some(row) = rows.next()? {
        let res: T = from_row(row)?;
        Ok(res)
    } else {
        Err(crate::Error::NotFound)
    }
}

pub(crate) fn many<T>(
    db_pool: &SqlitePool,
    sql: &str,
    params: &[&dyn ToSql],
    from_row: fn(&Row) -> Result<T>,
) -> Result<Vec<T>> {
    let conn = db_pool.get()?;
    let mut stmt = conn.prepare(sql)?;
    let mut rows = stmt.query(params)?;

    let mut res_vec = Vec::new();

    while let Some(row) = rows.next()? {
        let res: T = from_row(row)?;
        res_vec.push(res);
    }

    Ok(res_vec)
}
