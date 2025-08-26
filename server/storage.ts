import type { User } from "@shared/schema";

export interface IStorage {
  getUsers(): Promise<User[]>;
  createUser(user: Omit<User, 'id'>): Promise<User>;
}

export class MemStorage implements IStorage {
  private users: User[] = [];
  private nextId = 1;

  async getUsers(): Promise<User[]> {
    return this.users;
  }

  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const user: User = {
      ...userData,
      id: this.nextId++
    };
    this.users.push(user);
    return user;
  }
}

export const storage = new MemStorage();