/**
 * apps/api/src/controllers/user.controller.ts
 */

import type { UserService } from "../services/user.service"
import type { User } from "@cms/core/db/schema"
import type { PaginatedResult, PaginationParams } from "@cms/core/types/repositories"

export class UserController {
  constructor(private readonly userService: UserService) {}

  async getById(siteId: string, id: string): Promise<User> {
    return this.userService.getById(siteId, id)
  }

  async list(siteId: string, pagination: PaginationParams): Promise<PaginatedResult<User>> {
    return this.userService.listUsers(siteId, pagination)
  }

  async create(siteId: string, input: { email: string; name: string; role: User["role"]; avatarUrl?: string; bio?: string }): Promise<User> {
    return this.userService.createUser(siteId, input)
  }

  async update(siteId: string, id: string, input: Partial<{ name: string; role: User["role"]; avatarUrl: string | null; bio: string | null; website: string | null; twitter: string | null }>): Promise<User> {
    return this.userService.updateUser(siteId, id, input)
  }

  async delete(siteId: string, id: string): Promise<void> {
    return this.userService.deleteUser(siteId, id)
  }
}
