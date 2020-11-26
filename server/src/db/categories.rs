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

pub(crate) async fn create(
    db_pool: &Pool,
    user_id: Key,
    category: &interop::ProtoCategory,
) -> Result<interop::Category> {
    pg::one_from::<Category, interop::Category>(
        db_pool,
        include_str!("sql/categories_create.sql"),
        &[&user_id, &category.title],
    )
    .await
}

pub(crate) async fn all(db_pool: &Pool, user_id: Key) -> Result<Vec<interop::Category>> {
    pg::many_from::<Category, interop::Category>(
        db_pool,
        include_str!("sql/categories_all.sql"),
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
        include_str!("sql/categories_get.sql"),
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
        include_str!("sql/categories_edit.sql"),
        &[&user_id, &category_id, &category.title],
    )
    .await
}

pub(crate) async fn delete(db_pool: &Pool, user_id: Key, id: Key) -> Result<()> {
    pg::zero_from(
        db_pool,
        include_str!("sql/categories_delete.sql"),
        &[&user_id, &id],
    )
    .await
}
