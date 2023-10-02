// Copyright (C) 2022 Inderjit Gill <email@indy.io>

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

use rusqlite::Connection;
use rusqlite_migration::{Migrations, M};

/*
the current schema:

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL,

    password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    user_id INTEGER NOT NULL,

    title TEXT NOT NULL,

    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    user_id INTEGER NOT NULL,
    category_id INTEGER,

    title TEXT NOT NULL,
    content TEXT NOT NULL,

    pinned BOOLEAN NOT NULL DEFAULT false,

    triaged_at DATETIME,
    deleted_at DATETIME,

    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE NO ACTION,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE ON UPDATE NO ACTION
);
 */

/*
proposed:

CREATE TABLE IF NOT EXISTS checklistitems (
    id INTEGER PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    note_id INTEGER NOT NULL,

    content TEXT NOT NULL,
    state INTEGER DEFAULT 0,

    FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE ON UPDATE NO ACTION
);

    -- TODO: add this column to notes
    -- if this is not null, then category_id, pinned, triaged_at and deleted_at can be ignored
    -- and title will be automatically generated
    diary_date DATE,


 */

pub(crate) fn migration_check(db_name: &str) -> crate::Result<()> {
    // Define migrations
    let migrations = Migrations::new(vec![M::up(
        r#"
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL,

    password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    user_id INTEGER NOT NULL,

    title TEXT NOT NULL,

    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    user_id INTEGER NOT NULL,
    category_id INTEGER,

    title TEXT NOT NULL,
    content TEXT NOT NULL,

    pinned BOOLEAN NOT NULL DEFAULT false,

    triaged_at DATETIME,
    deleted_at DATETIME,

    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE ON UPDATE NO ACTION,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE ON UPDATE NO ACTION
);
"#,
    )]);

    let mut conn = Connection::open(db_name)?;

    // Apply some PRAGMA, often better to do it outside of migrations
    conn.pragma_update(None, "journal_mode", &"WAL")?;

    // Update the database schema, atomically
    migrations.to_latest(&mut conn)?;

    Ok(())
}

/*
use rusqlite::{params, Row};
use crate::db::sqlite::{zero, SqlitePool};
use crate::db::pg;
use crate::interop::Key;
use chrono::{Datelike, Timelike};
use serde::{Deserialize, Serialize};
use tokio_pg_mapper_derive::PostgresMapper; // need this so that year(), month(), etc can work

#[derive(Deserialize, PostgresMapper, Serialize)]
#[pg_mapper(table = "users")]
struct User {
    id: Key,
    created_at: chrono::DateTime<chrono::Utc>,
    email: String,
    username: String,
    password: String,
}

#[derive(Deserialize, PostgresMapper, Serialize)]
#[pg_mapper(table = "categories")]
struct Category {
    id: Key,
    created_at: chrono::DateTime<chrono::Utc>,
    user_id: Key,
    title: String,
}

#[derive(Deserialize, PostgresMapper, Serialize)]
#[pg_mapper(table = "notes")]
struct Note {
    id: Key,
    created_at: chrono::DateTime<chrono::Utc>,

    user_id: Key,
    category_id: Option<Key>,

    title: String,
    content: String,

    pinned: bool,

    triaged_at: Option<chrono::DateTime<chrono::Utc>>,
    deleted_at: Option<chrono::DateTime<chrono::Utc>>,
}

pub(crate) async fn migrate_from_postgres(
    sqlite_pool: SqlitePool,
    postgres_pool: deadpool_postgres::Pool,
) -> Result<()> {
    let all_users = pg::many::<User>(
        &postgres_pool,
        "SELECT $table_fields
         FROM users",
        &[],
    )
    .await?;

    for user in all_users {
        create_sqlite_user(&sqlite_pool, &user)?;
    }

    let all_categories = pg::many::<Category>(
        &postgres_pool,
        "SELECT $table_fields
         FROM categories",
        &[],
    )
    .await?;

    for category in all_categories {
        create_sqlite_category(&sqlite_pool, &category)?;
    }

    let all_notes = pg::many::<Note>(
        &postgres_pool,
        "SELECT $table_fields
         FROM notes",
        &[],
    )
    .await?;

    for note in all_notes {
        create_sqlite_note(&sqlite_pool, &note)?;
    }

    Ok(())
}

fn create_sqlite_user(sqlite_pool: &SqlitePool, user: &User) -> Result<()> {
    zero(
        sqlite_pool,
        r#"
               insert into users (id, created_at, email, username, password)
               values(?1, ?2, ?3, ?4, ?5)
            "#,
        params![
            user.id,
            as_naive_datetime(user.created_at),
            user.email,
            user.username,
            user.password
        ],
    )
}

fn create_sqlite_category(sqlite_pool: &SqlitePool, cat: &Category) -> Result<()> {
    zero(
        sqlite_pool,
        r#"
               insert into categories (id, created_at, user_id, title)
               values(?1, ?2, ?3, ?4)
            "#,
        params![
            cat.id,
            as_naive_datetime(cat.created_at),
            cat.user_id,
            cat.title
        ],
    )
}

fn create_sqlite_note(sqlite_pool: &SqlitePool, note: &Note) -> Result<()> {
    zero(
        sqlite_pool,
        r#"
               insert into notes (id, created_at, user_id, category_id, title, content, pinned, triaged_at, deleted_at)
               values(?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
            "#,
        params![
            note.id,
            as_naive_datetime(note.created_at),
            note.user_id,
            note.category_id,
            note.title,
            note.content,
            note.pinned,
            as_maybe_naive_datetime(note.triaged_at),
            as_maybe_naive_datetime(note.deleted_at)
        ],
    )
}

fn as_naive_datetime(d: chrono::DateTime<chrono::Utc>) -> chrono::NaiveDateTime {
    chrono::NaiveDate::from_ymd(d.year(), d.month(), d.day()).and_hms(
        d.hour(),
        d.minute(),
        d.second(),
    )
}

fn as_maybe_naive_datetime(
    od: Option<chrono::DateTime<chrono::Utc>>,
) -> Option<chrono::NaiveDateTime> {
    if let Some(d) = od {
        Some(as_naive_datetime(d))
    } else {
        None
    }
}
*/
