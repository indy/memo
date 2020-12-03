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
use actix_web::HttpResponse;
use deadpool_postgres::Pool;

#[allow(unused_imports)]
use tracing::info;

pub async fn get_all(db_pool: Data<Pool>, session: actix_session::Session) -> Result<HttpResponse> {
    info!("get_all");

    let user_id = session::user_id(&session)?;

    let triaged_notes = db::triaged_all(&db_pool, user_id).await?;

    Ok(HttpResponse::Ok().json(triaged_notes))
}

pub async fn get(
    db_pool: Data<Pool>,
    params: Path<IdParam>,
    session: actix_session::Session,
) -> Result<HttpResponse> {
    info!("get note {:?}", params.id);

    let user_id = session::user_id(&session)?;
    let note_id = params.id;

    let triaged_note = db::triaged_get(&db_pool, user_id, note_id).await?;

    Ok(HttpResponse::Ok().json(triaged_note))
}

pub async fn untriage(
    db_pool: Data<Pool>,
    params: Path<IdParam>,
    session: actix_session::Session,
) -> Result<HttpResponse> {
    info!("untriage note {:?}", params.id);

    let user_id = session::user_id(&session)?;
    let note_id = params.id;

    let untriaged_note = db::untriage(&db_pool, user_id, note_id).await?;

    Ok(HttpResponse::Ok().json(untriaged_note))
}

pub async fn bin(
    db_pool: Data<Pool>,
    params: Path<IdParam>,
    session: actix_session::Session,
) -> Result<HttpResponse> {
    info!("bin triaged note {:?}", params.id);

    let user_id = session::user_id(&session)?;
    let note_id = params.id;

    let binned_note = db::bin(&db_pool, user_id, note_id).await?;

    Ok(HttpResponse::Ok().json(binned_note))
}
