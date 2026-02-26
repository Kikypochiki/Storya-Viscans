import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-border">
        {/* Logo */}
        <div className="w-12 h-12 rounded-full border-2 border-foreground flex items-center justify-center font-bold text-foreground text-lg">
          S
        </div>

        {/* Nav Links */}
        <ul className="flex items-center gap-8 list-none">
          <li>
            <a href="#" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
              Home
            </a>
          </li>
          <li>
            <a href="#" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
              About Us
            </a>
          </li>
          <li>
            <a href="#" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
              Contact
            </a>
          </li>
        </ul>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-4">
        <p className="text-muted-foreground text-base tracking-wide">Welcome to</p>
        <h1 className="text-6xl font-black text-foreground tracking-tighter font-serif">
          StoryaViscans
        </h1>
        <p className="text-muted-foreground text-sm">Your university community forum</p>

        {/* CTA Buttons */}
        <div className="flex gap-4 mt-6">
          <Button variant="outline" size="lg" asChild>
            <a href="/login">Login</a>
          </Button>
          <Button size="lg" asChild>
            <a href="/signup">Signup</a>
          </Button>
        </div>
      </main>

    </div>
  );
}
