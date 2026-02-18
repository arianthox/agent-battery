import keytar from "keytar";

const SERVICE_NAME = "AgentBattery";

export class CredentialService {
  async setCredential(accountId: string, secret: string): Promise<void> {
    await keytar.setPassword(SERVICE_NAME, accountId, secret);
  }

  async getCredential(accountId: string): Promise<string | null> {
    return keytar.getPassword(SERVICE_NAME, accountId);
  }

  async deleteCredential(accountId: string): Promise<boolean> {
    return keytar.deletePassword(SERVICE_NAME, accountId);
  }
}
