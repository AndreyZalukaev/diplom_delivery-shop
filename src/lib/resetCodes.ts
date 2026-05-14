/** Временное хранилище кодов сброса пароля в памяти (globalThis) */
declare global {
  var _resetCodes: Map<string, { code: string; expiresAt: number }> | undefined;
}

const getGlobalMap = () => {
  if (!globalThis._resetCodes) {
    globalThis._resetCodes = new Map();
  }
  return globalThis._resetCodes;
};

/** Получить все коды сброса */
export const getResetCodes = () => getGlobalMap();

/** Сохранить код сброса */
export const setResetCode = (key: string, code: string, expiresAt: number) => {
  getGlobalMap().set(key, { code, expiresAt });
};

/** Удалить код сброса */
export const deleteResetCode = (key: string) => getGlobalMap().delete(key);

/** Получить конкретный код сброса по ключу */
export const getResetCode = (key: string) => getGlobalMap().get(key);
