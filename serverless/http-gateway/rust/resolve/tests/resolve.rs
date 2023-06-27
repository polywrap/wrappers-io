#[cfg(test)]
mod tests {
    use async_trait::async_trait;
    use axum::{http::StatusCode, Json, extract::Path};
    use mockall::{mock, predicate::eq};
    use resolve::{Version, Package, UriResponse, RepositoryError, Repository};

    mock! {
      PackageRepository {} 
        #[async_trait]
        impl Repository<Package> for PackageRepository { 
            async fn read(&self, key: &str) -> Result<Package, RepositoryError>;
            async fn update(&self, entity: Package) -> Result<(), RepositoryError>;
        }
    }

    #[tokio::test]
    async fn test_resolve_package_not_found() {
        let mut package_repo = MockPackageRepository::new();

        package_repo.expect_read()
            .with(eq("user1/package1".to_string()))
            .return_once(move |_| {
                Err(RepositoryError::NotFound)
            });

        let result = resolve::resolve(package_repo, Path(("user1".into(), "package1".into()))).await;

        assert!(matches!(result, Err(StatusCode::NOT_FOUND)));
    }

    #[tokio::test]
    async fn test_resolve_version_not_found() {
        let mut package_repo = MockPackageRepository::new();

        let package = Package {
            name: "package1".into(),
            versions: vec![Version { name: "version1".into(), uri: "uri1".into() }]
        };

        package_repo.expect_read()
            .with(eq("user1/package1".to_string()))
              .return_once(move |_| {
                  Ok(package.clone())
              });

        let result = resolve::resolve(package_repo, Path(("user1".into(), "package1@version2".into()))).await;

        assert!(matches!(result, Err(StatusCode::NOT_FOUND)));
    }

    #[tokio::test]
    async fn test_resolve_successful() {
      let mut package_repo = MockPackageRepository::new();

        let uri = "uri1";
        let package = Package {
            name: "package1".into(),
            versions: vec![Version { name: "version1".into(), uri: uri.to_string() }]
        };

        package_repo.expect_read()
            .with(eq("user1/package1".to_string()))
                .return_once(move |_| {
                    Ok(package.clone())
                });

        let result = resolve::resolve(package_repo, Path(("user1".into(), "package1@version1".into()))).await;

        let expected_response = UriResponse { uri: uri.to_string() };

        let _r: Result<Json<UriResponse>, StatusCode> =  Ok(Json(expected_response));

        assert!(matches!(result, _r));
    }
}
