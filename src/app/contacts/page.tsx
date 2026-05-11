import type { Metadata } from "next";
import { ContactsContent } from "./ContactsContent";

export const metadata: Metadata = {
  title: "Контакты | Северяночка - адреса магазинов и телефоны",
  description:
    "Контакты компании Северяночка. Адреса магазинов в Архангельске, телефоны бухгалтерии, склада и отдела лояльности. Схема проезда и часы работы.",
};

export default function ContactsPage() {
  return <ContactsContent />;
}
