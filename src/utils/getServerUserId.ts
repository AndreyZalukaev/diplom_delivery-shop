import { cookies } from "next/headers";

/** Получить ID пользователя из кук на сервере */
export async function getServerUserId(): Promise<number | null> {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user");
    if (!userCookie?.value) return null;
    const userData = JSON.parse(userCookie.value);
    return userData.id || null;
  } catch {
    return null;
  }
}
