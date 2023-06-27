use resolve;
use lambda_http::Error as HttpError;

#[tokio::main]
async fn main() -> Result<(), HttpError> {
    resolve::setup().await
}