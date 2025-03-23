import { users } from '../data/users';

export const queries = {
  users: () => users,
  user: (_: any, { id }: { id: string }) => users.find(user => user.id === id),
}; 