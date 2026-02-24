/**
 * apps/api/src/controllers/setup.controller.ts
 */

import type { SetupService } from "../services/setup.service";

export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  async isSetupRequired(): Promise<{ required: boolean }> {
    const required = await this.setupService.isSetupRequired();
    return { required };
  }

  async runSetup(input: {
    admin: { name: string; email: string; password: string };
    site: { name: string; description?: string; subdomain: string };
    email?: { provider: string; fromName: string; fromEmail: string };
  }): Promise<{ siteId: string; userId: string }> {
    return this.setupService.runSetup(input);
  }
}
