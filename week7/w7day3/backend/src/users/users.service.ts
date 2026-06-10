import { Injectable } from '@nestjs/common';

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  googleId: string;
  createdAt: Date;
}

@Injectable()
export class UsersService {
  // In-memory store (replace with DB/TypeORM in production)
  private users = new Map<string, User>();

  async findByGoogleId(googleId: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.googleId === googleId) return user;
    }
    return undefined;
  }

  async findById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async findOrCreate(data: {
    googleId: string;
    email: string;
    name: string;
    picture?: string;
  }): Promise<User> {
    const existing = await this.findByGoogleId(data.googleId);
    if (existing) return existing;

    const user: User = {
      id: `usr_${Date.now()}`,
      ...data,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }
}
