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

      {/* RIGHT HALF — paper style panel using CSS variable tokens */}
      <div
        className="w-1/2 min-h-screen flex flex-col items-start justify-center px-16 gap-5 relative"
        style={{
          background: "#FDFCF0",
          boxShadow: "inset 4px 0 24px rgba(0,0,0,0.06)",
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

        {/* Ink accent bar — --primary */}
        <div
          className="w-10 h-1 rounded-full mb-1"
          style={{ background: "var(--primary)" }}
        />

        {/* Title group */}
        <div className="flex flex-col gap-0">
          <p
            className="text-xl italic leading-none tracking-wide"
            style={{
              color: "var(--primary)",
              fontFamily: "var(--font-serif)",
            }}
          >
            Welcome to
          </p>

          <h1
            className="text-7xl font-black tracking-tighter leading-tight"
            style={{
              color: "var(--foreground)",
              fontFamily: "var(--font-serif)",
            }}
          >
            StoryaViscans
          </h1>
        </div>

        {/* Ruled-line dividers — --border */}
        <div className="w-full flex flex-col gap-2 mt-1">
          <div style={{ height: "1px", background: "var(--border)" }} />
          <div style={{ height: "1px", background: "var(--border)", opacity: 0.5 }} />
        </div>

        {/* Subtitle — muted-foreground */}
        <div className="flex flex-col gap-2 max-w-sm">
          <p
            className="text-sm leading-relaxed"
            style={{
              color: "var(--muted-foreground)",
              fontFamily: "var(--font-serif)",
            }}
          >
            Your unified forum for university announcements, student-led discussions, and academic resources.
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{
              color: "var(--muted-foreground)",
              fontFamily: "var(--font-serif)",
            }}
          >
            A safe, organized, and inclusive space — made by Viscans, for Viscans.
          </p>
        </div>

        {/* Another ruled line */}
        <div style={{ width: "100%", height: "1px", background: "var(--border)", opacity: 0.4 }} />

        {/* CTA Buttons */}
        <div className="flex gap-4 mt-2">
          {/* Login — outlined, uses --primary border + --foreground text */}
          <Button
            variant="outline"
            size="lg"
            asChild
            className="text-lg px-16 py-2 rounded-md font-semibold"
            style={{
              borderColor: "var(--primary)",
              color: "var(--foreground)",
              background: "transparent",
              fontFamily: "var(--font-serif)",
            }}
          >
            <a href="/login">Login</a>
          </Button>

          {/* Signup — solid --primary fill */}
          <Button
            size="lg"
            asChild
            className="text-lg px-16 py-2 rounded-md font-bold hover:opacity-90"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              fontFamily: "var(--font-serif)",
            }}
          >
            <a href="/signup">Signup</a>
          </Button>
        </div>
      </div>

    </div>
  );
}
