import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Heart, Globe2, BookOpen, Users, Mail, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/_app/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="pb-10">
      <div className="relative overflow-hidden bg-gradient-to-br from-[var(--clay)] via-primary to-[var(--ochre)] px-5 pb-10 pt-6 text-primary-foreground">
        <Link to="/home" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="mt-6 flex items-center gap-3">
          <Logo size="sm" />
        </div>
        <h1 className="mt-4 font-serif text-3xl font-bold">About PLATO</h1>
        <p className="mt-2 max-w-md text-sm opacity-90">
          The Plateau Digital Cultural Archive — a living, mobile-first home for the languages, stories,
          proverbs, music and craft of Plateau State's 17 LGAs.
        </p>
      </div>

      <section className="px-5 pt-6">
        <h2 className="font-serif text-lg font-semibold">Our mission</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Plateau State is one of Africa's most linguistically diverse regions — home to dozens of
          tribes and dialects, many of which are at risk of fading. PLATO exists to preserve, celebrate
          and pass on this heritage by giving everyone — elders, students, the diaspora and curious
          visitors — a beautiful, modern way to learn, listen and contribute.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 px-5 pt-6">
        <Pillar icon={Globe2} title="Preserve" body="Digitise endangered dialects, oral history & traditions." />
        <Pillar icon={BookOpen} title="Educate" body="Lessons, quizzes & curated cultural learning paths." />
        <Pillar icon={Heart} title="Celebrate" body="Showcase art, music, attire, beadwork and proverbs." />
        <Pillar icon={Users} title="Empower" body="Crowdsource contributions from native speakers." />
      </section>

      <section className="px-5 pt-8">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4" />
            <p className="text-xs font-semibold uppercase tracking-wider">What you can do here</p>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-foreground">
            <li>• Explore the 17 LGAs and their dominant tribes & dialects</li>
            <li>• Learn words, sentences, proverbs and stories with native audio</li>
            <li>• Take quizzes to test what you've learned</li>
            <li>• Watch cultural videos and listen to oral archives</li>
            <li>• Shop authentic attire, beads and crafts from Plateau artisans</li>
            <li>• Contribute words, corrections or stories from your community</li>
          </ul>
        </div>
      </section>

      <section className="px-5 pt-8">
        <h2 className="font-serif text-lg font-semibold">Built with the community</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          PLATO is open to every Plateau native, scholar and ally. The archive grows stronger every
          time someone submits a word, a proverb, a song or a correction — your voice is part of this.
        </p>
        <Link
          to="/contribute"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--clay)] to-[var(--ochre)] px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md"
        >
          Contribute now
        </Link>
      </section>

      <section className="px-5 pt-8">
        <div className="rounded-2xl bg-muted/40 p-5">
          <div className="flex items-center gap-2 text-primary">
            <Mail className="h-4 w-4" />
            <p className="text-sm font-semibold">Get in touch</p>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            For partnerships, schools or research collaboration — reach out via the contribute form
            and select "Suggestion".
          </p>
        </div>
        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          © {new Date().getFullYear()} PLATO · A digital archive for Plateau State
        </p>
      </section>
    </div>
  );
}

function Pillar({ icon: Icon, title, body }: { icon: typeof Heart; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 font-serif text-base font-bold">{title}</p>
      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
