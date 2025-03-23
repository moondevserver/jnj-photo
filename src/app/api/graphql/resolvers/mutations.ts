import { User, users, removeUser } from '../data/users';

export const mutations = {
  createUser: (_: any, { name, email }: { name: string; email: string }) => {
    const newUser: User = {
      id: String(users.length + 1),
      name,
      email,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    return newUser;
  },
  updateUser: (_: any, { id, name, email }: { id: string; name?: string; email?: string }) => {
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    const updatedUser = {
      ...users[userIndex],
      ...(name && { name }),
      ...(email && { email }),
    };
    
    users[userIndex] = updatedUser;
    return updatedUser;
  },
  deleteUser: (_: any, { id }: { id: string }) => {
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return false;
    }
    
    removeUser(id);
    return true;
  },
}; 