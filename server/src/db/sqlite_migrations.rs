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

    ui_config_json TEXT NOT NULL DEFAULT '{}', -- an opaque json string used exclusively by the client

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
    let migrations = Migrations::new(vec![

        ///////////////////
        // user_version 1
        ///////////////////
        M::up("CREATE TABLE IF NOT EXISTS users (
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
               );"),

        ///////////////////
        // user_version 2: users.ui_config json string
        ///////////////////
        M::up("ALTER TABLE users ADD COLUMN ui_config_json TEXT NOT NULL DEFAULT '{}';"),


    ]);

    let mut conn = Connection::open(db_name)?;

    // Apply some PRAGMA, often better to do it outside of migrations
    conn.pragma_update(None, "journal_mode", &"WAL")?;

    // Update the database schema, atomically
    migrations.to_latest(&mut conn)?;

    Ok(())
}
