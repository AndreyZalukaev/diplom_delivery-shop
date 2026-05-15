import Actions from "@/components/Actions";
import Articles from "@/components/Articles";
import Maps from "@/components/Maps";
import NewProducts from "@/components/NewProducts";
import Purchases from "@/components/Purchases";
import Slider from "@/components/Slider/Slider";
import SpecialOffers from "@/components/SpecialOffers";
import { Suspense } from "react";
import Loader from "@/components/Loader";
import { getServerUserRole } from "@/utils/getServerUserRole";

/** Главная страница */
export default async function Home() {
  const role = await getServerUserRole();
  const isAdmin = role === "admin";

  const sections = [
    { component: <Actions />, text: "акций" },
    { component: <NewProducts />, text: "новинок" },
    { component: <Purchases />, text: "Ваших покупок" },
  ];

  if (!isAdmin) {
    sections.push({ component: <SpecialOffers />, text: "специальных предложений" });
  }

  sections.push(
    { component: <Maps />, text: "карт" },
    { component: <Articles />, text: "статей" }
  );

  return (
    <main className="w-full mx-auto">
      <Suspense fallback={<Loader text="слайдера" />}><Slider /></Suspense>
      <div className="px-[max(12px,calc((100%-1208px)/2))] flex flex-col gap-y-20">
        {sections.map((item, index) => (
          <Suspense key={index} fallback={<Loader text={item.text} />}>
            {item.component}
          </Suspense>
        ))}
      </div>
    </main>
  );
}
