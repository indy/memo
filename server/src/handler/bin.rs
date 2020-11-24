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

use crate::db::notes as db;
use crate::error::Result;
use crate::interop::IdParam;
use crate::session;
use actix_web::web::{Data, Path};
use actix_web::{HttpResponse};
use deadpool_postgres::Pool;


#[allow(unused_imports)]
use tracing::info;

pub async fn get_all(db_pool: Data<Pool>, session: actix_session::Session) -> Result<HttpResponse> {
    info!("get_all");

    let user_id = session::user_id(&session)?;

    let notes = db::all_binned(&db_pool, user_id).await?;

    Ok(HttpResponse::Ok().json(notes))
}

pub async fn delete_all(db_pool: Data<Pool>, session: actix_session::Session) -> Result<HttpResponse> {
    info!("delete_all");

    let user_id = session::user_id(&session)?;

    db::delete_all(&db_pool, user_id).await?;

    Ok(HttpResponse::Ok().json(true))
}

pub async fn get(
    db_pool: Data<Pool>,
    params: Path<IdParam>,
    session: actix_session::Session,
) -> Result<HttpResponse> {
    info!("get note {:?}", params.id);

    let user_id = session::user_id(&session)?;
    let note_id = params.id;

    let note = db::get(&db_pool, user_id, note_id).await?;

    Ok(HttpResponse::Ok().json(note))
}

pub async fn unbin(
    db_pool: Data<Pool>,
    params: Path<IdParam>,
    session: actix_session::Session,
) -> Result<HttpResponse> {
    info!("delete");

    let user_id = session::user_id(&session)?;
    let note_id = params.id;

    let note = db::unbin(&db_pool, user_id, note_id).await?;

    Ok(HttpResponse::Ok().json(note))
}

pub async fn delete(
    db_pool: Data<Pool>,
    params: Path<IdParam>,
    session: actix_session::Session,
) -> Result<HttpResponse> {
    info!("delete");

    let user_id = session::user_id(&session)?;

    db::delete(&db_pool, user_id, params.id).await?;

    Ok(HttpResponse::Ok().json(true))
}
