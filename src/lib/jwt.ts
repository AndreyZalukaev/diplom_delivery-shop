import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

/** Генерация JWT-токена для пользователя */
export const generateToken = (userId: number, email: string) => {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: '7d' });
};

/** Проверка JWT-токена, возвращает payload или null */
export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
  } catch {
    return null;
  }
};
