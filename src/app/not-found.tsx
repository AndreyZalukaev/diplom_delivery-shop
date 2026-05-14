import Link from "next/link";

/** Кастомная страница 404 */
export default function NotFound() {
  return (
    <section className="w-full mx-auto px-[max(12px,calc((100%-1208px)/2))] flex flex-col items-center justify-center min-h-[60vh] text-[#414141]">
      <h1 className="text-8xl md:text-9xl font-bold text-(--color-primary) mb-4">404</h1>
      <h2 className="text-2xl md:text-3xl font-bold mb-4">Страница не найдена</h2>
      <p className="text-base md:text-lg mb-8 text-center max-w-md">
        К сожалению, запрашиваемая страница не существует или была перемещена.
      </p>
      <Link href="/" className="px-6 py-3 bg-(--color-primary) text-white rounded-lg hover:opacity-90 transition-colors duration-300 font-medium">
        На главную
      </Link>
    </section>
  );
}
