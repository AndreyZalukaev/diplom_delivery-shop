import { cookies } from "next/headers";

export async function getServerUserRole(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get("user");
    if (!userCookie?.value) return null;
    const userData = JSON.parse(userCookie.value);
    return userData.role || null;
  } catch {
    return null;
  }
}
