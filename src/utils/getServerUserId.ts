import { cookies } from "next/headers";

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
