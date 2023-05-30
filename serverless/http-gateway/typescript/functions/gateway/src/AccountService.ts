import axios from "axios";

export class AccountService {
  constructor(private readonly accountServiceUri: string, private readonly adminKey: string) { }
  
  async verify(user: string, apiKey: string | undefined): Promise<boolean> {
    try {
      const response = await axios.get(`${this.accountServiceUri}/u/${user}/verify/${apiKey}/${this.adminKey}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.status === 200;
    } catch (error: any) {
      console.error(`An error occurred: ${error.message}`);
      return false;
    }
  }
}