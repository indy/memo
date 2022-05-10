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

use crate::db::sqlite::{one, zero, SqlitePool};
use crate::error::Result;
use crate::interop::users as interop;
use crate::interop::Key;
use rusqlite::{params, Row};
use tracing::info;

pub(crate) fn login(
    db_pool: &SqlitePool,
    login_credentials: &interop::LoginCredentials,
) -> Result<(Key, String, interop::User)> {
    fn from_row(row: &Row) -> Result<(Key, String, interop::User)> {
        let id: Key = row.get(0)?;
        let password: String = row.get(3)?;

        Ok((
            id,
            password.to_string(),
            interop::User {
                username: row.get(2)?,
                email: row.get(1)?,
                admin: None,
            },
        ))
    }

    one::<(Key, String, interop::User)>(
        db_pool,
        r#"
           select id, email, username, password
           from users
           where email = ?1
        "#,
        params![login_credentials.email],
        from_row,
    )
}

pub(crate) fn create(
    db_pool: &SqlitePool,
    registration: &interop::Registration,
    hash: &str,
) -> Result<(Key, interop::User)> {
    info!("create");

    // stupid 2 statements: create, then check for update.
    // later versions of sqlite3 (after 2021-03) have a 'returning' keyword
    //
    zero(
        db_pool,
        r#"
           insert into users (email, username, password)
           values(?1, ?2, ?3)
        "#,
        params![registration.email, registration.username, hash],
    )?;

    fn from_row(row: &Row) -> Result<(Key, interop::User)> {
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
    one::<(Key, interop::User)>(
        db_pool,
        r#"
           select id, email, username
           from users
           where email = ?1 and password = ?2
        "#,
        params![registration.email, hash],
        from_row,
    )
}

pub(crate) fn get(db_pool: &SqlitePool, user_id: Key) -> Result<interop::User> {
    fn from_row(row: &Row) -> Result<interop::User> {
        Ok(interop::User {
            username: row.get(1)?,
            email: row.get(0)?,
            admin: None,
        })
    }

    one::<interop::User>(
        db_pool,
        r#"
           select email, username
           from users
           where id = ?1
        "#,
        params![user_id],
        from_row,
    )
}
