/** Проверка наличия аватара пользователя */
export async function checkAvatarExists(userId: string | number): Promise<boolean> {
  try {
    const response = await fetch(`/api/auth/avatar/${userId}/check`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.exists === true;
  } catch (error) {
    console.error("Error checking avatar:", error);
    return false;
  }
}
