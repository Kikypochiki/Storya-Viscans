🎙️ StoryaViscans

A community-driven platform for Viscans to share stories, engage in social discussions, and access academic resources.

💡 The Problem
While groups like "Storya sa Biska" on Facebook prove there is a massive hunger for community sharing at VSU, relying on global social media creates three critical failures:

        ⚠️ Information Overload: Vital university announcements are buried under "shitposting," memes, and irrelevant content.

        🔒 Lack of Privacy: Sensitive campus-specific discussions are exposed to a global audience, losing the "safe space" feel.

        📂 No Central Archive: Important student-led discussions or localized news disappear within hours due to the Facebook algorithm.

    StoryaViscans solves this by providing a dedicated, organized, and searchable home for all things VSU.

✨ Key Features
🏫 Campus-Specific Channels: Categorized boards for Academic Affairs, Orgs, Buy and Sell, Lost and Found, and "Secret Spilling" (Confessions).

    📢 Verified Announcements: A dedicated "Official" tab for faculty and student council updates to ensure high visibility.

    🗳️ Community Governance: Upvoting/Downvoting system to prioritize helpful discussions and filter out spam.

    🌙 Viscan Identity: Profile badges for different colleges (FAFS, FC, FVM, etc.) to foster school spirit.

    📱 Progressive Web App (PWA): Lightweight and accessible via mobile for students with limited data.

🛠️ Tech Stack
Category | Tech Stack
------------|------------
Frontend | Next.js 16, TypeScript, Tailwind CSS, Shadcn UI
Backend | Supabase
Database | Supabase PostgreSQL

🚀 Getting Started 1. Installation # Clone the repository
git clone https://github.com/your-username/StoryaViscans.git

        # Navigate to the project directory
        cd StoryaViscans

        # Install dependencies
    npm install

    2. Environment Setup
        Create a .env file in the root directory:
        NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
        NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

    3. Run the Development Server
        npm run dev

🚧 Challenges We Faced - Real-time Performance: Optimizing Supabase subscriptions to ensure "Storyas" appear instantly without lagging the UI.

    - Schema Complexity: Designing a relational database structure that handles nested comments and upvote logic efficiently.

    - Inclusive Design: Balancing a modern look with high performance for users on older mobile devices around campus.

📈 What's Next for StoryaViscans? - 🎓 VSU Email OAuth: Restricting posting rights to verified @vsu.edu.ph accounts.

    - 🎟️ Event Ticketing: Built-in RSVP system for VSU anniversary events and college intramurals.

    - 🤖 AI Moderation: Using NLP to automatically flag hate speech or community guideline violations.

                 👥 The Team

| Name | Role |
| Dohn Michael Varquez | 🏗️ Lead Developer |
| Gian Carlo Suico | 🎨 Frontend Developer |
| Martin Benedict Ybas | ⚙️ Backend Developer |
| Norman John Bandibas | 🗄️ Database Administrator |
