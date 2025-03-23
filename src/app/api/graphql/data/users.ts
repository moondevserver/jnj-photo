// 타입 정의
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

// 가상 데이터베이스
export let users: User[] = [
  {
    id: '1',
    name: '홍길동',
    email: 'hong@example.com',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: '김철수',
    email: 'kim@example.com',
    createdAt: new Date().toISOString(),
  },
];

// 데이터 업데이트를 위한 함수들
export const updateUsersData = (newUsers: User[]) => {
  users = newUsers;
};

export const removeUser = (id: string) => {
  users = users.filter(user => user.id !== id);
}; 