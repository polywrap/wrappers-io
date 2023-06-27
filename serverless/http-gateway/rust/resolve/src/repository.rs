use async_trait::async_trait;

pub enum RepositoryError {
    NotFound,
    Unknown(String),
}

#[async_trait]
pub trait Repository<TEntity> {
    async fn read(&self, key: &str) -> Result<TEntity, RepositoryError>;
    async fn update(&self, entity: TEntity) -> Result<(), RepositoryError>;
}
