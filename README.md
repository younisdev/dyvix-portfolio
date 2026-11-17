<div align="center">
  <img src="./static/logo.png" width="275" height="275" alt="Dyvix Portfolio Logo" />
  <h1>Dyvix Portfolio</h1>
</div>
<h4 align="center">
  A modern, config-driven, scalable developer portfolio built with Next.js, TypeScript, Tailwind CSS, and Dyvix UI.
</h4>

## Preview

<p align="center">
  <img src="./static/demo.gif" width="90%" alt="Dyvix Portfolio Desktop Preview" />
</p>

### Live Demo

[View Live Demo](https://younisdev.vercel.app/)

## Features

- **JSON-Driven Architecture:** Manage portfolio content through centralized configuration, including hero details, skills marquee, projects, social links, and custom sections.
- **Database Integrated:** Maintain full control of your portfolio from anywhere via an owner-locked admin dashboard.
- **Live GitHub Analytics:** Showcase your contributions and repository stats (stars, forks, PRs, commits) fetched from GitHub, cached in the database, and refreshed automatically after a week.
- **Themeable:** Create custom themes effortlessly to transform the visual look of your portfolio.
- **Scalable:** Extend the platform easily by adding your own custom components and sections.
- **Dyvix UI Powered:** Built on top of a themeable, headless JSON UI library with multi-layer caching.
- **Multiple Versioned Portfolios:** Switch between different layouts, themes, and content snapshots with a single click.
- **Built-In Dynamic JSON Config Editor:** Easily add, modify, or remove portfolio presets dynamically without touching source code.
- **End-to-End Type-Safe Stack:** Built with TypeScript, React, Next.js, PostgreSQL, Drizzle ORM, and Dyvix UI.

## Getting Started

### Prerequisites

- **Node.js** (v20 or higher)
- **PostgreSQL** database.

1. **Clone the repository**

   ```bash
   git clone https://github.com/younisdev/dyvix-portfolio.git
   cd dyvix-portfolio
   ```

2. **Install the dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a .env.local file in the root directory and add your credentials.

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/DATABASENAME"
   JWT_SECRET="YOUR_SECRET_PASSWORD"
   ```

   - DATABASE_URL: Your PostgreSQL connection string.

   - JWT_SECRET: A strong, randomly generated secret key (at least 16 characters).

   > **Note:** Never commit or share your environment variables.

4. **Push the database schema**

   ```bash
   npm run db:push
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

   Open the local URL provided in your terminal (usually http://localhost:3000).

### Guide

Check out [GUIDE.md](./GUIDE.md) for more information.

## Contributing

Feel free to open meaningful issues and PRs.
