"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// React Query et les notifications arrivent avec le formulaire : l'accueil ne les charge pas au démarrage.
const ContactForm = dynamic(
  () =>
    Promise.all([import("@/components/marketing/contact-form"), import("@/app/providers")]).then(([form, providers]) => {
      const Island = () => (
        <providers.Providers>
          <form.ContactForm />
        </providers.Providers>
      );
      return Island;
    }),
  { ssr: false, loading: () => <FormSkeleton /> },
);

function FormSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
      ))}
      <div className="h-28 animate-pulse rounded-lg bg-gray-100 sm:col-span-2" />
    </div>
  );
}

/** Le formulaire (et ses bibliothèques) ne se charge qu'à l'approche de la section : accueil plus léger en 3G. */
export function LazyContactForm() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Lien direct vers #contact : charger tout de suite.
    if (window.location.hash === "#contact") return setVisible(true);
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && setVisible(true), { rootMargin: "600px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return <div ref={ref}>{visible ? <ContactForm /> : <FormSkeleton />}</div>;
}
