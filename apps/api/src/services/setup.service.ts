/**
 * apps/api/src/services/setup.service.ts
 *
 * Setup wizard — creates the initial site, admin user, default newsletter, etc.
 * Only runs when setup_completed = false.
 */

import crypto from "node:crypto";
import type {
  ISiteRepository,
  IUserRepository,
  ISettingsRepository,
} from "@cms/core/types/repositories";
import type { INewsletterRepository } from "@cms/core/types/repositories";
import type { IEmailProvider } from "@cms/core/types/providers";
import { ConflictError, ValidationError } from "@cms/core/errors";
import { generateSlug } from "@cms/core/utils/permalink";
import type { SiteService } from "./site.service";
import type { UserService } from "./user.service";
import type { NewsletterService } from "./newsletter.service";
import type { SettingsService } from "./settings.service";

export class SetupService {
  constructor(
    private readonly siteService: SiteService,
    private readonly userService: UserService,
    private readonly newsletterService: NewsletterService,
    private readonly settingsService: SettingsService,
    private readonly emailProvider: IEmailProvider | null
  ) {}

  async isSetupRequired(): Promise<boolean> {
    // If no admin user exists for the root site, setup is required
    try {
      const sites = await this.siteService.getAll({ page: 1, limit: 1 });
      return sites.meta.total === 0;
    } catch {
      return true;
    }
  }

  async runSetup(input: {
    admin: { name: string; email: string; password?: string };
    site: { name: string; description?: string; subdomain: string };
    email?: { provider: string; fromName: string; fromEmail: string };
  }): Promise<{ siteId: string; userId: string }> {
    const alreadyDone = !(await this.isSetupRequired());
    if (alreadyDone) {
      throw new ConflictError("Setup has already been completed");
    }

    const subdomain = generateSlug(input.site.subdomain);

    // 1. Create the site
    const site = await this.siteService.create({
      name: input.site.name,
      description: input.site.description ?? null,
      slug: subdomain,
      custom_domain: null,
      setup_completed: false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // 2. Create the admin user
    const user = await this.userService.createUser(site.id, {
      email: input.admin.email,
      name: input.admin.name,
      role: "owner",
    });

    // 3. Create the default newsletter
    await this.newsletterService.createNewsletter(site.id, {
      name: input.site.name,
      senderName: input.site.name,
      senderEmail: input.email?.fromEmail ?? input.admin.email,
    });

    // 4. Initialize default site settings
    await this.settingsService.updateSiteSettings(site.id, {
      permalink_format: "/{slug}/",
      timezone: "UTC",
      meta_title: "",
      meta_description: "",
      cover_image: "",
      logo: "",
      icon: "",
      accent_color: "",
      facebook: "",
      twitter: "",
      codeinjection_head: "",
      codeinjection_foot: "",
      default_content_visibility: "public",
      members_support_address: input.admin.email,
    });

    // 5. Mark setup complete
    await this.siteService.markSetupComplete(site.id);

    return { siteId: site.id, userId: user.id };
  }
}
