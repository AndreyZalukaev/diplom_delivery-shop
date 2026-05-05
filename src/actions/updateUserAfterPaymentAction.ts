"use server";

import pool from "@/lib/pg";
import { getServerUserId } from "@/utils/getServerUserId";

export const updateUserAfterPaymentAction = async (data: {
  usedBonuses: number;
  earnedBonuses: number;
  purchasedProductIds: string[];
}) => {
  const userId = await getServerUserId();
  if (!userId) throw new Error("Пользователь не авторизован");

  const userResult = await pool.query(
    "SELECT bonuses_count, purchases FROM users WHERE id = $1",
    [userId]
  );

  if (userResult.rows.length === 0) {
    throw new Error("Пользователь не найден");
  }

  const currentBonuses = Number(userResult.rows[0].bonuses_count) || 0;
  const rawPurchases = userResult.rows[0].purchases;

  let currentPurchases: number[] = [];
  if (Array.isArray(rawPurchases)) {
    currentPurchases = rawPurchases.map(Number);
  } else if (rawPurchases && typeof rawPurchases === 'object') {
    currentPurchases = Object.values(rawPurchases).map(Number);
  }

  const usedBonusesNum = Number(data.usedBonuses) || 0;
  const earnedBonusesNum = Number(data.earnedBonuses) || 0;

  if (usedBonusesNum > currentBonuses) {
    throw new Error("Недостаточно бонусов");
  }

  const newBonuses = currentBonuses - usedBonusesNum + earnedBonusesNum;

  const uniqueNewIds = (data.purchasedProductIds || [])
    .map(Number)
    .filter((id, index, self) => self.indexOf(id) === index);

  const updatedPurchases = [
    ...new Set([...currentPurchases, ...uniqueNewIds]),
  ];

  // Формируем строку для PostgreSQL integer[]: '{1,2,3}'
  const purchasesArray = '{' + updatedPurchases.join(',') + '}';

  const updateResult = await pool.query(
    `UPDATE users
     SET bonuses_count = $1,
         purchases = $2::integer[],
         cart = '[]'::jsonb
     WHERE id = $3
     RETURNING bonuses_count, purchases`,
    [newBonuses, purchasesArray, userId]
  );

  if (updateResult.rows.length === 0) {
    throw new Error("Не удалось обновить данные пользователя");
  }

  return {
    bonuses: updateResult.rows[0].bonuses_count,
    purchases: updateResult.rows[0].purchases,
    cartCleared: true,
  };
};
