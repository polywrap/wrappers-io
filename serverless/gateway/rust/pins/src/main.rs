use lambda_runtime::{service_fn, LambdaEvent, Error};
use serde_json::{Value};
use serde_derive::*;
use aws_sdk_dynamodb::{Client, Error as DynamoError};
use tokio_stream::StreamExt;

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

type Response = Result<SuccessResponse, Error>;

#[tokio::main]
async fn main() -> Result<(), Error> {
    env_logger::init();
    println!("main");
    let func = service_fn(handler);
    println!("func");
    lambda_runtime::run(func).await?;

    Ok(())
}

async fn handler(event: LambdaEvent<Value>) -> Response {
    let (event, _context) = event.into_parts();
    // let first_name = event["firstName"].as_str().unwrap_or("world");

    println!("shared_config");
    let shared_config = aws_config::from_env().region("us-east-1").load().await;
    println!("client");
    let client = Client::new(&shared_config);
    println!("list_items");
    let items = list_items(&client, "uploaded-wrappers-table-dev").await?;
    Ok(SuccessResponse {
        body: "Hello, world!".to_string(),
    })
}

pub async fn list_items(client: &Client, table: &str) -> Result<(), DynamoError> {
  let items: Result<Vec<_>, _> = client
      .scan()
      .table_name(table)
      .into_paginator()
      .items()
      .send()
      .collect()
      .await;
      println!("await");

  println!("Items in table:");
  for item in items? {
      println!("   {:?}", item);
  }

  Ok(())
}

