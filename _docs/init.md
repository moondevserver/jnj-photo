1. `.env` 파일 설정:
```ini
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public" 
```

2. postgreSQL 데이터베이스 설정:
```sql
CREATE DATABASE your_database_name;
```

3. 의존성 설치:
```bash
npm install
```

4. Prisma 설정:
```bash
npx prisma generate
npx prisma db push
```
