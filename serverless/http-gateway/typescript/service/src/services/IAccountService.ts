export interface IAccountService {
  verify(user: string, apiKey: string | undefined): Promise<boolean>;
}
