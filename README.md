# StoryaViscans

A community-driven platform for Viscans to share stories, engage in social discussions, and access academic resources.

## 💡 The Problem
While groups like "Storya sa Biska" on Facebook prove there is a massive hunger for community sharing at VSU, relying on global social media creates three critical failures:

+ ⚠️ **Information Overload**: Vital university announcements are buried under "shitposting," memes, and irrelevant content.
+ 🔒 **Lack of Privacy**: Sensitive campus-specific discussions are exposed to a global audience, losing the "safe space" feel.
+ 📂 **No Central Archive**: Important student-led discussions or localized news disappear within hours due to the Facebook algorithm.

StoryaViscans solves this by providing a dedicated, organized, and searchable home for all things VSU.

## ✨ Key Features

### 🏫 Campus-Specific Channels: .

- ### 📢 Verified Announcements: A dedicated "Official" tab for faculty and student council updates to ensure high visibility.

- ### 🌐 Social: A dedicated space for students to connect, share experiences, and engage in general campus-related discussions.

- ### 💰 Buy and Sell: A community marketplace designed for students to safely trade, sell, or buy textbooks, uniforms, and other school-related items.

- ### 🔍 Lost and Found: A streamlined board to report missing items or post found belongings to help them reach their rightful owners within the campus.

- ### 🛡️ Safety Concerns: A platform for reporting and discussing campus safety issues, ensuring students stay informed about their environment.

- ### 📚 Study Groups: A collaborative feature to find or organize peer-to-peer study sessions for specific subjects or exam preparation..

- ### 📂 Resource Sharing: A digital library for students to share helpful academic materials, such as notes, review guides, and open-source learning tools..

- ### ❓ Help: A support hub where students can ask questions and receive assistance regarding campus life, academic requirements, or technical issues..


### ⚖️ Community Governance: Upvoting/Downvoting system to prioritize helpful discussions and filter out spam.


## 🚀 Technologies Used
* **Framework**: Next.js 15.1.6 (App Router)
* **Library**: React 19.2.3
* **Styling**: Tailwind CSS 4.0 with PostCSS
* **Language**: TypeScript
* **Linting**: ESLint 9
* **Database**: Supabase PostgreSQL
* **Compiler Optimization**: Babel Plugin for React Compiler

## 🛠️ Getting Started

### Prerequisites

Ensure you have Node.js installed (version 20 or higher is recommended).

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
### Environment Setup
Create a .env file in the root directory:
```     
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```
### Development
Run the development server:
``` bash
npm run dev
```

Open http://localhost:3000 with your browser to see the result.

## 🚧 Challenges We Faced - Real-time Performance: Optimizing Supabase subscriptions to ensure "Storyas" appear instantly without lagging the UI.

- Schema Complexity: Designing a relational database structure that handles nested comments and upvote logic efficiently.

- Inclusive Design: Balancing a modern look with high performance for users on older mobile devices around campus.

## 📈 What's Next for StoryaViscans? - 🎓 VSU Email OAuth: Restricting posting rights to verified @vsu.edu.ph accounts.

- 🎟️ Event Ticketing: Built-in RSVP system for VSU anniversary events and college intramurals.

- 🤖 AI Moderation: Using NLP to automatically flag hate speech or community guideline violations.

## 👥 The Team

| Name | Role |  
| Dohn Michael Varquez | 🏗️ Lead Developer |  
| Gian Carlo Suico | 🎨 Frontend Developer |  
| Martin Benedict Ybas | ⚙️ Backend Developer |  
| Norman John Bandibas | 🗄️ Database Administrator & Backend Developer|