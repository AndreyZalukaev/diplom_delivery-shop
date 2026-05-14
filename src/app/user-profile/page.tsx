/** Страница профиля пользователя */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProfileHeader from "./_components/ProfileHeader";
import SecuritySection from "./_components/SecuritySection";
import ProfileAvatar from "./_components/ProfileAvatar";
import LocationSection from "./_components/LocationSection";
import ProfileCard from "./_components/ProfileCard";
import ProfilePassword from "./_components/ProfilePassword";
import ProfileName from "./_components/ProfileName";
import Loader from "@/components/Loader";

interface UserData {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  gender?: string;
  location?: string;
  loyalty_card?: string;
  has_card?: boolean;
  phone_verified?: boolean;
  email_verified?: boolean;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUser = () => {
      const userData = localStorage.getItem("user");
      if (!userData) {
        router.replace("/");
        return;
      }
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
      } catch {
        router.replace("/");
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [router]);

  if (isLoading) {
    return <Loader />;
  }

  if (!user) {
    return <Loader />;
  }

  return (
    <div className="bg-[#fbf8ec] px-4 md:px-6 xl:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="animate-slide-in opacity translate-y-8">
          <div className="bg-white rounded-xl shadow-xl overflow-hidden duration-700 ease-out">
            <ProfileHeader name={user.name} />
            <div className="p-6 md:p-8">
              <ProfileAvatar userId={user.id} gender={user.gender} />
              <ProfileName
                userId={user.id}
                initialName={user.name || ""}
                onUpdate={(data) => {
                  const updatedUser = { ...user, ...data };
                  setUser(updatedUser);
                  localStorage.setItem("user", JSON.stringify(updatedUser));
                  window.dispatchEvent(new Event("user-login"));
                }}
              />
              <LocationSection
                userId={user.id}
                initialLocation={user.location || ""}
                onUpdate={(data) => {
                  const updatedUser = { ...user, ...data };
                  setUser(updatedUser);
                  localStorage.setItem("user", JSON.stringify(updatedUser));
                  window.dispatchEvent(new Event("user-login"));
                }}
              />
              <ProfileCard user={user} setUser={setUser} />
              <ProfilePassword user={user} />
              <SecuritySection user={user} setUser={setUser} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
