import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, DollarSign, Home, ShieldCheck, TrendingUp, Users, Wrench } from "lucide-react";
import type { ReactNode } from "react";

const CHECKOUT_URL = "https://checkout.vendepay.com/30419f0a-34e2-4aad-9a5b-0a72026cf6ab";

const problems = [
  "Vous voulez un revenu complémentaire, mais vous ne savez pas par quelle compétence commencer",
  "Vous en avez assez des activités annexes qui exigent publicité, stock ou outils compliqués",
  "Vous voyez des problèmes informatiques autour de vous, mais vous ne savez pas comment les transformer en missions payées",
  "Vous voulez quelque chose de concret que vous pouvez commencer cette semaine",
];

const benefits = [
  {
    icon: <Wrench size={24} />,
    title: "Services très demandés",
    text: "Apprenez les services informatiques accessibles aux débutants que les gens paient déjà : nettoyage, accélération, remplacement par SSD, aide à l’installation et dépannage de base.",
  },
  {
    icon: <DollarSign size={24} />,
    title: "Guide de tarification simple",
    text: "Utilisez des fourchettes de prix pratiques pour faire vos devis avec confiance, éviter de sous-facturer et savoir quoi proposer en premier.",
  },
  {
    icon: <Users size={24} />,
    title: "Plan pour trouver vos premiers clients",
    text: "Trouvez des clients locaux via des canaux simples de proximité sans devoir créer une marque compliquée.",
  },
  {
    icon: <Home size={24} />,
    title: "Méthode d’intervention à domicile",
    text: "Comprenez comment gérer les visites locales, les étapes de service de base et le suivi pour rassurer vos clients.",
  },
  {
    icon: <TrendingUp size={24} />,
    title: "Système de revenus récurrents",
    text: "Transformez les réparations ponctuelles en recommandations, prestations répétées et revenu mensuel plus solide.",
  },
  {
    icon: <ShieldCheck size={24} />,
    title: "Confiance pour débutants",
    text: "Utilisez scripts, checklists et étapes claires pour démarrer même sans certification technique.",
  },
];

const fitItems = [
  "Vous voulez un revenu complémentaire sans gros investissement initial",
  "Vous êtes prêt à apprendre une compétence technique pratique",
  "Vous voulez un chemin simple vers votre premier client payant",
  "Vous préférez un service local concret à une nouvelle promesse en ligne",
  "Vous voulez des étapes claires, des scripts et des conseils de prix",
];

export const Route = createFileRoute("/landingpage")({
  head: () => ({
    meta: [
      { title: "Revenu complémentaire en réparant des ordinateurs" },
      {
        name: "description",
        content: "Découvrez comment transformer des services simples de réparation informatique en revenu mensuel complémentaire.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <main className="min-h-dvh overflow-x-hidden bg-[#070A08] text-white antialiased">
      <Hero />
      <ProblemSection />
      <BenefitsSection />
      <FitSection />
      <GuaranteeSection />
      <FinalOffer />
      <footer className="border-t border-white/10 bg-[#080808] px-5 py-8 text-center text-xs font-semibold text-[#8D98A7]">
        Copyright 2025. All rights reserved.
      </footer>
    </main>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-white/10 px-5">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_-10%,rgba(0,228,124,0.24),transparent_36%),linear-gradient(180deg,#0B1A12_0%,#070A08_62%,#070A08_100%)]" />
      <div className="mx-auto flex min-h-[92dvh] w-full max-w-5xl flex-col items-center justify-center py-16 text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-[#00E47C]/35 bg-[#00E47C]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#00E47C]">
          <CheckCircle2 size={15} />
          Proven Method
        </p>

        <h1 className="mt-8 max-w-5xl text-[clamp(3.2rem,10vw,7.2rem)] font-black uppercase leading-[0.9] text-white">
          Make Money
          <span className="block text-[#00E47C]">en réparant des ordinateurs</span>
        </h1>

        <p className="mx-auto mt-7 max-w-2xl text-balance text-lg font-medium leading-8 text-[#D7DEE8] sm:text-xl">
          A practical guide for turning simple computer repair services into 500 €-1 500 €/month in extra income without expensive courses or advanced experience.
        </p>

        <div className="mt-10 grid w-full max-w-3xl gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="rounded-[8px] border border-white/12 bg-white/[0.07] p-5 text-left shadow-[0_24px_70px_rgba(0,0,0,.32)]">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#9CA3AF]">Accès instantané</p>
            <div className="mt-3 flex items-end gap-3">
              <p className="text-5xl font-black text-[#00E47C]">37 €</p>
              <p className="pb-2 text-sm font-bold text-[#AAB4C3]">paiement unique</p>
            </div>
          </div>
          <CtaButton label="Obtenir l’accès instantané" />
        </div>

        <p className="mt-5 text-sm font-semibold text-[#9CA3AF]">Paiement sécurisé | Accès instantané | Garantie 7 jours</p>
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <SectionShell>
      <div className="mx-auto max-w-4xl">
        <Eyebrow>Le problème</Eyebrow>
        <SectionTitle>Cela vous ressemble ?</SectionTitle>
        <p className="mt-6 max-w-3xl text-lg font-medium leading-8 text-[#D7DEE8]">
          La plupart des gens compliquent trop les revenus complémentaires. Vous n’avez pas besoin d’une grande audience, de stock ou d’un diplôme technique pour démarrer avec des services informatiques simples.
        </p>
        <div className="mt-9 grid gap-3">
          {problems.map((item) => (
            <div className="flex items-start gap-4 rounded-[8px] border border-white/10 bg-white/[0.055] p-5 text-base font-semibold text-[#EDF2F7]" key={item}>
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#FE2C55]/15 text-sm font-black text-[#FF5C76]">X</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function BenefitsSection() {
  return (
    <SectionShell tone="muted">
      <div className="mx-auto max-w-6xl">
        <Eyebrow>Ce que vous recevez</Eyebrow>
        <SectionTitle>Tout ce qu’il faut pour commencer</SectionTitle>
        <p className="mt-5 max-w-3xl text-lg font-medium leading-8 text-[#D7DEE8]">
          A focused, practical roadmap built for someone who wants to start small, learn fast, and land paid work locally.
        </p>
        <div className="mt-11 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((item) => (
            <article className="rounded-[8px] border border-white/10 bg-[#0B0F0D] p-6 shadow-[0_18px_42px_rgba(0,0,0,.24)]" key={item.title}>
              <div className="mb-5 grid h-12 w-12 place-items-center rounded-[8px] border border-[#00E47C]/25 bg-[#00E47C]/10 text-[#00E47C]">
                {item.icon}
              </div>
              <h3 className="text-lg font-black text-white">{item.title}</h3>
              <p className="mt-3 text-sm font-medium leading-7 text-[#AAB4C3]">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function FitSection() {
  return (
    <SectionShell>
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <Eyebrow>À qui cela s’adresse</Eyebrow>
          <SectionTitle>Ce guide est pour vous si...</SectionTitle>
          <div className="mt-8 grid gap-4">
            {fitItems.map((item) => (
              <p className="flex items-start gap-3 text-base font-bold leading-7 text-[#EDF2F7]" key={item}>
                <CheckCircle2 className="mt-0.5 shrink-0 text-[#00E47C]" size={21} />
                {item}
              </p>
            ))}
          </div>
        </div>
        <div className="rounded-[8px] border border-[#00E47C]/30 bg-[#00E47C]/10 p-7 text-center shadow-[0_22px_60px_rgba(0,228,124,.08)]">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#00E47C]">Objectif mensuel réaliste</p>
          <p className="mt-5 text-[clamp(3.4rem,11vw,6rem)] font-black uppercase leading-none text-[#00E47C]">1 500 €</p>
          <p className="mx-auto mt-5 max-w-xl text-base font-semibold leading-7 text-[#D7DEE8]">
            Possible with consistent effort, local demand, and repeat customers in your area.
          </p>
        </div>
      </div>
    </SectionShell>
  );
}

function GuaranteeSection() {
  return (
    <SectionShell tone="muted">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full border border-[#00E47C]/40 bg-[#00E47C]/10 text-[#00E47C]">
          <ShieldCheck size={40} />
        </div>
        <Eyebrow centered>Garantie</Eyebrow>
        <SectionTitle centered>Garantie satisfait ou remboursé de 7 jours</SectionTitle>
        <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-8 text-[#D7DEE8]">
          If the guide is not useful for you, request a refund within 7 days. Simple, clear, and no complicated process.
        </p>
      </div>
    </SectionShell>
  );
}

function FinalOffer() {
  return (
    <section className="bg-[#101512] px-5 py-18 text-center sm:py-24">
      <div className="mx-auto max-w-3xl rounded-[8px] border border-white/10 bg-white/[0.055] p-6 shadow-[0_30px_80px_rgba(0,0,0,.26)] sm:p-10">
        <Eyebrow centered>Offre spéciale</Eyebrow>
        <SectionTitle centered>Commencez aujourd’hui</SectionTitle>
        <p className="mx-auto mt-5 max-w-2xl text-lg font-medium leading-8 text-[#D7DEE8]">
          Get instant access to the full guide and start building your first local service offer today.
        </p>
        <p className="mt-8 text-5xl font-black text-[#00E47C]">
          37 € <span className="text-base font-semibold text-[#9AA3AF]">paiement unique</span>
        </p>
        <CtaButton className="mx-auto mt-8" label="Réclamer mon accès maintenant" />
        <p className="mt-5 text-sm font-semibold text-[#9AA3AF]">Paiement sécurisé | Accès instantané | Garantie 7 jours</p>
      </div>
    </section>
  );
}

function CtaButton({ label, className = "" }: { label: string; className?: string }) {
  return (
    <a
      className={`flex min-h-14 w-full items-center justify-center rounded-[8px] bg-[#00E47C] px-6 text-sm font-black uppercase tracking-[0.04em] text-black shadow-[0_18px_55px_rgba(0,228,124,.24)] transition hover:bg-[#28F291] active:scale-[0.99] sm:min-w-[300px] ${className}`}
      href={CHECKOUT_URL}
      rel="noreferrer"
      target="_blank"
    >
      {label} -&gt;
    </a>
  );
}

function SectionShell({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "muted" }) {
  return (
    <section className={`border-b border-white/10 px-5 py-16 sm:py-24 ${tone === "muted" ? "bg-[#0D0F0E]" : "bg-[#070A08]"}`}>
      {children}
    </section>
  );
}

function Eyebrow({ children, centered = false }: { children: ReactNode; centered?: boolean }) {
  return <p className={`text-sm font-black uppercase tracking-[0.18em] text-[#00E47C] ${centered ? "text-center" : ""}`}>{children}</p>;
}

function SectionTitle({ children, centered = false }: { children: ReactNode; centered?: boolean }) {
  return (
    <h2 className={`mt-4 text-[clamp(2.25rem,7vw,4.4rem)] font-black uppercase leading-[0.95] text-white ${centered ? "mx-auto text-center" : ""}`}>
      {children}
    </h2>
  );
}
