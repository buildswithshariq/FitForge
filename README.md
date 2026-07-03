# FitTrack

A modern, premium fitness and health tracking web application designed to help users achieve their goals with precision and a beautiful user experience. 

Built with **Next.js (App Router)**, **Tailwind CSS v4**, **shadcn/ui**, and **Prisma ORM**.

## Features

- **Intelligent Goal Engine**: Set goals (Lose, Maintain, or Gain Weight). Automatically calculates recommended daily calories and macros (Protein, Carbs, Fats) based on baseline stats and activity level.
- **Diet & Nutrition Logging**: Search for foods, add custom foods, and track exact macronutrient intake against daily targets.
- **Workout Tracking**: Log exercises, sets, reps, bodyweight exercises, and time-based activities. Automatically calculates total calories burned.
- **Progress Analytics**: Beautiful, responsive charts dashboard (using Recharts) that provides a continuous timeline of weight trends, workout durations, and calorie expenditure, with PDF export.
- **Health Tools**: Built-in utilities like BMI (Body Mass Index) and BMR (Basal Metabolic Rate) calculators.
- **Premium UI/UX**: Sleek dark mode, glassmorphism, interactive charts, and highly polished components.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [Prisma ORM](https://www.prisma.io/) with PostgreSQL
- **Authentication**: [Better Auth](https://better-auth.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Validation**: [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
4. Run the seed script (optional, to populate food database):
   ```bash
   npx tsx prisma/seed.ts
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

## License

This project is licensed under the MIT License.
