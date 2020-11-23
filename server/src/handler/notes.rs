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
use crate::interop::notes as interop;
use crate::interop::IdParam;
use crate::session;
use actix_multipart::Multipart;
use actix_web::web::{Data, Json, Path};
use actix_web::{http, HttpResponse};
use chrono::{DateTime, Utc};
use deadpool_postgres::Pool;
use futures::{StreamExt, TryStreamExt};

#[allow(unused_imports)]
use tracing::info;

pub async fn bookmark(
    mut payload: Multipart,
    db_pool: Data<Pool>,
    session: actix_session::Session,
) -> Result<HttpResponse> {
    info!("bookmark");

    let now: DateTime<Utc> = Utc::now();

    let user_id = session::user_id(&session)?;
    let mut proto_note = interop::ProtoNote {
        title: now.format("%F %T").to_string(),
        content: "".to_string(),
    };

    // iterate over multipart stream
    while let Ok(Some(mut field)) = payload.try_next().await {
        let content_type = field.content_disposition().unwrap();
        if let Some(name) = content_type.get_name() {
            while let Some(chunk) = field.next().await {
                let data = chunk.unwrap();
                let value = std::str::from_utf8(&data).unwrap();

                if name == "title" {
                    proto_note.title = value.to_string();
                }
                if name == "content" {
                    proto_note.content = value.to_string();
                }
            }
        }
    }

    let _note = db::create(&db_pool, user_id, &proto_note).await?;

    Ok(redirect_to("/"))
}

fn redirect_to(location: &str) -> HttpResponse {
    HttpResponse::Found()
        .header(http::header::LOCATION, location)
        .finish()
}

pub async fn create(
    note: Json<interop::ProtoNote>,
    db_pool: Data<Pool>,
    session: actix_session::Session,
) -> Result<HttpResponse> {
    info!("create");

    let user_id = session::user_id(&session)?;
    let note = note.into_inner();

    info!("{:?}", &note);

    let note = db::create(&db_pool, user_id, &note).await?;

    Ok(HttpResponse::Ok().json(note))
}

pub async fn get_all(db_pool: Data<Pool>, session: actix_session::Session) -> Result<HttpResponse> {
    info!("get_all");

    let user_id = session::user_id(&session)?;

    let notes = db::all_active(&db_pool, user_id).await?;

    Ok(HttpResponse::Ok().json(notes))
}

pub async fn triage(
    db_pool: Data<Pool>,
    params: Path<IdParam>,
    session: actix_session::Session,
) -> Result<HttpResponse> {
    info!("get note {:?}", params.id);

    let user_id = session::user_id(&session)?;
    let note_id = params.id;

    let triaged_note = db::triage(&db_pool, user_id, note_id).await?;

    Ok(HttpResponse::Ok().json(triaged_note))
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

pub async fn edit(
    note: Json<interop::ProtoNote>,
    db_pool: Data<Pool>,
    params: Path<IdParam>,
    session: actix_session::Session,
) -> Result<HttpResponse> {
    info!("edit");

    let user_id = session::user_id(&session)?;
    let note_id = params.id;
    let note = note.into_inner();

    let note = db::edit(&db_pool, user_id, &note, note_id).await?;

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
