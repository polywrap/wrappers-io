use lambda_runtime::{service_fn, LambdaEvent, Error};
use serde_json::{Value};
use serde_derive::*;
use std::path::Path;
use aws_sdk_s3::{Client, Error as S3Error, types::ByteStream};

const VERSION: &str = "0.1.0";

#[derive(Deserialize)]
struct Request {
    pub body: String,
}

#[derive(Debug, Serialize)]
struct SuccessResponse {
    pub body: String,
}

#[derive(Debug, Serialize)]
struct FailureResponse {
    pub body: String,
}

// Implement Display for the Failure response so that we can then implement Error.
impl std::fmt::Display for FailureResponse {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.body)
    }
}

// Implement Error for the FailureResponse so that we can `?` (try) the Response
// returned by `lambda_runtime::run(func).await` in `fn main`.
impl std::error::Error for FailureResponse {}

type Response = Result<SuccessResponse, S3Error>;

#[tokio::main]
async fn main() -> Result<(), Error> {
    let func = service_fn(handler);
    lambda_runtime::run(func).await?;

    Ok(())
}

async fn handler(event: LambdaEvent<Value>) -> Response {
    let (event, _context) = event.into_parts();
    // let first_name = event["firstName"].as_str().unwrap_or("world");

    // Ok(json!({ "message": format!("Hello, {}!", first_name) }))
    // upload(
    //     "path-to-file",
    //     "S3-bucket",
    //     "filename-in-bucket",
    //   ).await?;

    Ok(SuccessResponse {
      body: format!("5Status: running<br>Version: {}", VERSION)
    })
}

pub async fn upload(path: &str, bucket: &str, key: &str) -> Result<aws_sdk_s3::output::PutObjectOutput, S3Error> {
    let config = aws_config::load_from_env().await;
    let client = Client::new(&config);
    let file = ByteStream::from_path(Path::new(path)).await;

    match file {
        Ok(f) => {
          let resp: aws_sdk_s3::output::PutObjectOutput = client
            .put_object()
            .bucket(bucket)
            .key(key)
            .body(f)
            .send()
            .await?;
          Ok(resp)
        },
        Err(e) => {
          panic!("Error uploading file: {:?}", e);
        }
    }
}
