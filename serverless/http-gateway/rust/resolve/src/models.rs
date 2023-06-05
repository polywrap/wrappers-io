use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Package {
    pub name: String,
    pub versions: Vec<Version>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Version {
    pub name: String,
    pub uri: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct UriResponse {
    pub uri: String,
}

