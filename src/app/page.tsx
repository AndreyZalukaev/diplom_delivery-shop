import Actions from "@/components/Actions";
import Articles from "@/components/Articles";
import Maps from "@/components/Maps";
import NewProducts from "@/components/NewProducts";
import Purchases from "@/components/Purchases";
import Slider from "@/components/Slider/Slider";
import SpecialOffers from "@/components/SpecialOffers";
import { Suspense } from "react";
import Loader from "@/components/Loader";

/** Главная страница */
export default function Home() {
  return (
    <main className="w-full mx-auto">
      <Suspense fallback={<Loader text="слайдера" />}><Slider /></Suspense>
      <div className="px-[max(12px,calc((100%-1208px)/2))] flex flex-col gap-y-20">
        {[
          { component: <Actions />, text: "акций" },
          { component: <NewProducts />, text: "новинок" },
          { component: <Purchases />, text: "Ваших покупок" },
          { component: <SpecialOffers />, text: "специальных предложений" },
          { component: <Maps />, text: "карт" },
          { component: <Articles />, text: "статей" },
        ].map((item, index) => (
          <Suspense key={index} fallback={<Loader text={item.text} />}>
            {item.component}
          </Suspense>
        ))}
      </div>
    </main>
  );
}
