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

use super::pg;
use crate::error::Result;
use crate::interop::categories as interop;
use crate::interop::Key;
use deadpool_postgres::Pool;
use serde::{Deserialize, Serialize};
use tokio_pg_mapper_derive::PostgresMapper;

#[derive(Deserialize, PostgresMapper, Serialize)]
#[pg_mapper(table = "categories")]
struct Category {
    id: Key,
    title: String,
}

impl From<Category> for interop::Category {
    fn from(category: Category) -> interop::Category {
        interop::Category {
            id: category.id,
            title: category.title,
        }
    }
}

// note: this returns an array of all the user's categories rather
// than the standard REST thing of the newly created category only
// (client requires a list of all the categories for the UI)
//
pub(crate) async fn create(
    db_pool: &Pool,
    user_id: Key,
    category: &interop::ProtoCategory,
) -> Result<Vec<interop::Category>> {
    pg::one_from::<Category, interop::Category>(
        db_pool,
        "INSERT INTO categories(user_id, title)
         VALUES ($1, $2)
         RETURNING $table_fields",
        &[&user_id, &category.title],
    )
    .await?;

    all(db_pool, user_id).await
}

pub(crate) async fn all(db_pool: &Pool, user_id: Key) -> Result<Vec<interop::Category>> {
    pg::many_from::<Category, interop::Category>(
        db_pool,
        "SELECT c.id,
                c.title
         FROM   categories c
         WHERE  c.user_id = $1
         ORDER BY c.title asc",
        &[&user_id],
    )
    .await
}

pub(crate) async fn get(
    db_pool: &Pool,
    user_id: Key,
    category_id: Key,
) -> Result<interop::Category> {
    pg::one_from::<Category, interop::Category>(
        db_pool,
        "SELECT c.id,
                c.title
         FROM categories c
         WHERE c.user_id = $1 AND c.id = $2",
        &[&user_id, &category_id],
    )
    .await
}

pub(crate) async fn edit(
    db_pool: &Pool,
    user_id: Key,
    category: &interop::ProtoCategory,
    category_id: Key,
) -> Result<interop::Category> {
    pg::one_from::<Category, interop::Category>(
        db_pool,
        "UPDATE categories
         SET title = $3
         WHERE id = $2 and user_id = $1
         RETURNING $table_fields",
        &[&user_id, &category_id, &category.title],
    )
    .await
}

pub(crate) async fn delete(db_pool: &Pool, user_id: Key, id: Key) -> Result<()> {
    pg::zero_from(
        db_pool,
        "DELETE FROM categories
         WHERE user_id = $1 AND id = $2",
        &[&user_id, &id],
    )
    .await
}
