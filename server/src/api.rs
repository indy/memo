// Copyright (C) 2020 Inderjit Gill <email@indy.io>

// This file is part of Civil

// Civil is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Civil is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

use crate::handler::users;
use crate::handler::notes;
use crate::handler::archived_notes;

use actix_files::NamedFile;
use actix_web::dev;
use actix_web::middleware::errhandlers::ErrorHandlerResponse;
use actix_web::web::{delete, get, post, put, scope};
use tracing::warn;

pub fn public_api(mount_point: &str) -> actix_web::Scope {
    scope(mount_point)
        // login/logout
        .service(
            scope("/auth")
                .route("", post().to(users::login))
                .route("", delete().to(users::logout)),
        )
        // registration
        .service(
            scope("/users")
                .route("", post().to(users::create_user))
                .route("", get().to(users::get_user)),
        )
        // notes
        .service(
            scope("/notes")
                .route("", post().to(notes::create))
                .route("", get().to(notes::get_all))
                .route("/{id}", get().to(notes::get))
                .route("/{id}", put().to(notes::edit))
                .route("/{id}", delete().to(notes::delete))
                .route("/{id}/archive", post().to(notes::archive))
        )
        // archived notes
        .service(
            scope("/archived-notes")
                .route("", get().to(archived_notes::get_all))
                .route("/{id}", get().to(archived_notes::get))
                .route("/{id}", delete().to(archived_notes::delete))
        )
}

pub fn bad_request<B>(res: dev::ServiceResponse<B>) -> actix_web::Result<ErrorHandlerResponse<B>> {
    let new_resp = NamedFile::open("errors/400.html")?
        .set_status_code(res.status())
        .into_response(res.request())?;
    warn!("bad request: {:?} {:?}", &res.status(), &res.request());
    Ok(ErrorHandlerResponse::Response(
        res.into_response(new_resp.into_body()),
    ))
}

pub fn not_found<B>(res: dev::ServiceResponse<B>) -> actix_web::Result<ErrorHandlerResponse<B>> {
    let new_resp = NamedFile::open("errors/404.html")?
        .set_status_code(res.status())
        .into_response(res.request())?;
    warn!("not found: {:?} {:?}", &res.status(), &res.request());
    Ok(ErrorHandlerResponse::Response(
        res.into_response(new_resp.into_body()),
    ))
}

pub fn internal_server_error<B>(
    res: dev::ServiceResponse<B>,
) -> actix_web::Result<ErrorHandlerResponse<B>> {
    let new_resp = NamedFile::open("errors/500.html")?
        .set_status_code(res.status())
        .into_response(res.request())?;
    warn!(
        "internal server error: {:?} {:?}",
        &res.status(),
        &res.request()
    );
    Ok(ErrorHandlerResponse::Response(
        res.into_response(new_resp.into_body()),
    ))
}
