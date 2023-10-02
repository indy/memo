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

use crate::db::sqlite::{one, FromRow, SqlitePool};
use crate::interop::users as interop;
use crate::interop::Key;
use rusqlite::{params, Row};
use tracing::info;

pub(crate) fn login(
    db_pool: &SqlitePool,
    login_credentials: &interop::LoginCredentials,
) -> crate::Result<(Key, String, interop::User)> {
    impl FromRow for (Key, String, interop::User) {
        fn from_row(row: &Row) -> crate::Result<(Key, String, interop::User)> {
            let id: Key = row.get(0)?;
            let password: String = row.get(3)?;

            Ok((
                id,
                password,
                interop::User {
                    username: row.get(2)?,
                    email: row.get(1)?,
                    admin: None,
                },
            ))
        }
    }

    let conn = db_pool.get()?;
    let stmt = "SELECT id, email, username, password
                FROM users
                WHERE email = ?1";
    one(&conn, stmt, params![login_credentials.email])
}

pub(crate) fn create(
    db_pool: &SqlitePool,
    registration: &interop::Registration,
    hash: &str,
) -> crate::Result<(Key, interop::User)> {
    info!("create");

    impl FromRow for (Key, interop::User) {
        fn from_row(row: &Row) -> crate::Result<(Key, interop::User)> {
            let id: Key = row.get(0)?;

            Ok((
                id,
                interop::User {
                    username: row.get(2)?,
                    email: row.get(1)?,
                    admin: None,
                },
            ))
        }
    }

    let conn = db_pool.get()?;
    let stmt = "INSERT INTO users (email, username, password)
                VALUES(?1, ?2, ?3)
                RETURNING id, email, username";
    one(
        &conn,
        stmt,
        params![registration.email, registration.username, hash],
    )
}

pub(crate) fn get(db_pool: &SqlitePool, user_id: Key) -> crate::Result<interop::User> {
    impl FromRow for interop::User {
        fn from_row(row: &Row) -> crate::Result<interop::User> {
            Ok(interop::User {
                username: row.get(1)?,
                email: row.get(0)?,
                admin: None,
            })
        }
    }

    let conn = db_pool.get()?;
    let stmt = "SELECT email, username
                FROM users
                WHERE id = ?1";
    one(&conn, stmt, params![user_id])
}
