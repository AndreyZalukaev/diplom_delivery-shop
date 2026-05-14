/** Страница поиска */
import { Suspense } from "react";
import SearchContent from "./SearchContent";
import Loader from "@/components/Loader";

export default function SearchPage() {
  return (
    <Suspense fallback={<Loader />}>
      <SearchContent />
    </Suspense>
  );
}
