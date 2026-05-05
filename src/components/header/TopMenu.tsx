"use client";

import { useState, useEffect } from "react";
import IconMenuMob from "../svg/IconMenuMob";
import Link from "next/link";
import { usePathname } from "next/navigation";
import IconBox from "../svg/IconBox";
import IconHeart from "../svg/IconHeart";
import IconCart from "../svg/IconCart";
import { useCart } from "@/contexts/CartContext";

const TopMenu = () => {
  const pathname = usePathname();
  const isCatalogPage = pathname === "/catalog";
  const isFavoritesPage = pathname === "/favorites";
  const isCartPage = pathname === "/cart";
  const [userRole, setUserRole] = useState<string>("user");

  const { totalItems, fetchCart } = useCart();

  useEffect(() => {
    const loadUserRole = () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setUserRole(user.role || "user");
        } catch {
          setUserRole("user");
        }
      } else {
        setUserRole("user");
      }
    };

    loadUserRole();

    const handleStorageChange = () => {
      loadUserRole();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("user-login", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("user-login", handleStorageChange);
    };
  }, []);

  const isManagerOrAdmin = userRole === "admin" || userRole === "manager";

  useEffect(() => {
    if (userRole !== "admin" && userRole !== "manager" && userRole !== "user") {
      return;
    }
    const isPrivileged = userRole === "admin" || userRole === "manager";
    if (!isPrivileged) {
      fetchCart();
    }
  }, [userRole, fetchCart]);

  return (
    <ul className="flex flex-row gap-x-6 items-end">
      <Link href="/catalog">
        <li className="flex flex-col items-center gap-2.5 md:hidden w-11 cursor-pointer">
          <IconMenuMob isCatalogPage={isCatalogPage} />
          <span className={isCatalogPage ? "text-[#ff6633]" : "text-[#414141]"}>
            Каталог
          </span>
        </li>
      </Link>

      {!isManagerOrAdmin && (
        <Link href="/favorites">
          <li className="flex flex-col items-center gap-2.5 w-11 cursor-pointer">
            <IconHeart isActive={isFavoritesPage} variant="orange" />
            <span className={isFavoritesPage ? "text-[#ff6633]" : "text-[#414141]"}>
              Избранное
            </span>
          </li>
        </Link>
      )}

      <li className="flex flex-col items-center gap-2.5 w-11 cursor-pointer">
        <IconBox />
        <span className={isManagerOrAdmin ? "text-[#ff6633]" : ""}>Заказы</span>
      </li>

      {!isManagerOrAdmin && (
        <li className="relative flex flex-col items-center gap-2.5 w-11 cursor-pointer">
          <Link
            href="/cart"
            className="flex flex-col items-center gap-2.5 w-11 cursor-pointer"
          >
            <IconCart isActive={isCartPage} />

            {totalItems > 0 && (
              <span className="absolute -top-2 right-0 bg-[#ff6633] text-white text-[9px] rounded w-4 h-4 flex items-center justify-center py-0.5 px-1">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}

            <span className={isCartPage ? "text-[#ff6633]" : ""}>
              Корзина
            </span>
          </Link>
        </li>
      )}
    </ul>
  );
};

export default TopMenu;
