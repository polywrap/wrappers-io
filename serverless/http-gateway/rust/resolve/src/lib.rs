mod dynamodb;
use aws_sdk_dynamodb::Client;
pub use dynamodb::*;

mod repository;
pub use repository::*;

mod models;
pub use models::*;

use axum::{extract::Path, routing::get, http::StatusCode, response::Json, Router};
use lambda_http::{run, Error as HttpError};
use tracing_subscriber::filter::LevelFilter;
use serde_json::{Value, json};

pub async fn resolve(
    Path((user, package_and_version)): Path<(String, String)>,
    package_repo: impl Repository<Package>
) -> Result<Json<UriResponse>, StatusCode> {
    let (package_name, version_name) = package_and_version.split_at(package_and_version.find('@').unwrap_or(package_and_version.len()));

    let id = format!("{}/{}", user, package_name);

    let package = package_repo
        .read(&id)
        .await
        .map_err(|error| match error {
            RepositoryError::NotFound => StatusCode::NOT_FOUND,
            _ => StatusCode::INTERNAL_SERVER_ERROR,
        })?;

    let version = package.versions
        .into_iter()
        .find(|version| version.name == version_name);

    match version {
        Some(version) => Ok(Json(UriResponse { uri: version.uri })),
        None => Err(StatusCode::NOT_FOUND),
    }
}

async fn get_package(path: Path<(String, String)>, package_repo: impl Repository<Package>) -> Result<Json<UriResponse>, StatusCode> {
    resolve(path, package_repo).await
}

async fn post_package(Path((user, package_and_version)): Path<(String, String)>, _package_repo: impl Repository<Package>) -> Json<Value> {
    Json(json!({ "msg": format!("User = {},  Package = {}", user, package_and_version) }))
}

pub async fn setup() -> Result<(), HttpError> {
    // required to enable CloudWatch error logging by the runtime
    tracing_subscriber::fmt()
        .with_max_level(LevelFilter::INFO)
        // disable printing the name of the module in every log line.
        .with_target(false)
        // this needs to be set to false, otherwise ANSI color codes will
        // show up in a confusing manner in CloudWatch logs.
        .with_ansi(false)
        // disabling time is handy because CloudWatch will add the ingestion time.
        .without_time()
        .init();

    let client = {
        let config = aws_config::load_from_env().await;
        Client::new(&config)
    };

    let table_name = std::env::var("TABLE_NAME").expect("TABLE_NAME environment variable not set");

    let app = Router::new()
        .route(
        "/u/:user/:packageAndVersion", 
                get(move |path: Path<(String, String)>| {
                    get_package(path, PackageRepository::new(client.clone(), table_name.clone()))
                })
                .post(move |path: Path<(String, String)>| {
                    post_package(path, PackageRepository::new(client.clone(), table_name.clone()))
                })
        );

    run(app).await
}