import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-row">

      {/* LEFT HALF — mountain background image */}
      <div
        className="w-1/2 min-h-screen"
        style={{
          backgroundImage: "url('/hero-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* RIGHT HALF — paper style panel */}
      <div
        className="w-1/2 min-h-screen flex flex-col items-start justify-center px-16 gap-5 relative"
        style={{
          background: "#FDFCF0",
          /* subtle paper texture via layered shadows and border */
          boxShadow: "inset 4px 0 24px rgba(0,0,0,0.08)",
        }}
      >
        {/* Paper grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        />

        {/* Ink accent bar */}
        <div
          className="w-10 h-1 rounded-full mb-1"
          style={{ background: "oklch(0.5338 0.1262 143.7998)" }}
        />

        {/* Title group — Welcome to sits tight above the title */}
        <div className="flex flex-col gap-0">
          <p
            className="text-xl italic leading-none tracking-wide"
            style={{
              color: "oklch(0.5338 0.1262 143.7998)",
              fontFamily: "var(--font-serif)",
            }}
          >
            Welcome to
          </p>

          <h1
            className="text-7xl font-black tracking-tighter leading-tight"
            style={{
              color: "oklch(0.4345 0.0942 143.7424)",
              fontFamily: "var(--font-serif)",
            }}
          >
            StoryaViscans
          </h1>
        </div>

        {/* Ruled-line divider — like notebook paper */}
        <div className="w-full flex flex-col gap-2 mt-1">
          <div style={{ height: "1px", background: "oklch(0.7897 0.1246 128.7309 / 0.40)" }} />
          <div style={{ height: "1px", background: "oklch(0.7897 0.1246 128.7309 / 0.20)" }} />
        </div>

        {/* Subtitle — muted ink text */}
        <div className="flex flex-col gap-2 max-w-sm">
          <p
            className="text-sm leading-relaxed"
            style={{
              color: "oklch(0.4345 0.0942 143.7424 / 0.75)",
              fontFamily: "var(--font-serif)",
            }}
          >
            Your unified forum for university announcements, student-led discussions, and academic resources.
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{
              color: "oklch(0.4345 0.0942 143.7424 / 0.75)",
              fontFamily: "var(--font-serif)",
            }}
          >
            A safe, organized, and inclusive space — made by Viscans, for Viscans.
          </p>
        </div>

        {/* Another ruled line */}
        <div style={{ width: "100%", height: "1px", background: "oklch(0.7897 0.1246 128.7309 / 0.30)" }} />

        {/* CTA Buttons */}
        <div className="flex gap-4 mt-2">
          {/* Login — outlined ink style */}
          <Button
            variant="outline"
            size="lg"
            asChild
            className="text-lg px-16 py-2 rounded-md font-semibold"
            style={{
              borderColor: "oklch(0.5338 0.1262 143.7998)",
              color: "oklch(0.4345 0.0942 143.7424)",
              background: "transparent",
              fontFamily: "var(--font-serif)",
            }}
          >
            <a href="/login">Login</a>
          </Button>

          {/* Signup — solid ink stamp style */}
          <Button
            size="lg"
            asChild
            className="text-lg px-16 py-2 rounded-md font-bold hover:opacity-90"
            style={{
              background: "oklch(0.5338 0.1262 143.7998)",
              color: "#FDFCF0",
              fontFamily: "var(--font-serif)",
            }}
          >
            <a href="/sign-up">Signup</a>
          </Button>
        </div>
      </div>

    </div>
  );
}
