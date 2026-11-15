# Contributing to Dyvix Portfolio

Thank you for your interest in contributing to Dyvix Portfolio! Contributions of all kinds are welcome.

## Getting Started

1. Fork the repository.
2. Clone your fork:

   ```bash
   git clone https://github.com/YOUR_USERNAME/dyvix-portfolio.git
   cd dyvix-portfolio
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the project root:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/DATABASENAME"
   JWT_SECRET="YOUR_SECRET_PASSWORD"
   ```

   - `DATABASE_URL`: Your PostgreSQL connection string.
   - `JWT_SECRET`: A strong, randomly generated secret key (at least 16 characters).

   > **Note:** Never commit or share your environment variables.

4. **Push the database schema**

   ```bash
   npm run db:push
   ```

5. **Create a feature branch**

   ```bash
   git checkout -b your-feature-name
   ```

6. Make your changes.
7. Test the affected functionality.
8. Commit and push your changes to your fork.
9. Open a Pull Request against the original repository.

## Ways You Can Help

### Report a Bug

Open an issue including:

- What happened.
- What you expected to happen.
- Steps to reproduce the issue.

### Suggest a Feature or Component

1. Open an issue describing your idea and its purpose.
2. Wait for feedback or confirmation before starting implementation.
3. Submit a Pull Request once the approach has been discussed.

### Improve Documentation

- Fix typos and grammatical errors.
- Add missing documentation.
- Improve clarity and consistency.

### Explore the Customization Guide

Check [GUIDE.md](./GUIDE.md) for instructions on customizing your portfolio, creating themes, and adding custom components.

## Contribution Guidelines

1. Treat the community with respect.
2. Follow the existing code style and project conventions.
3. Test your changes before submitting a Pull Request.
4. Reference the related issue when your PR addresses an existing issue.
5. Avoid opening more than 3–4 PRs simultaneously unless they are small and focused. Wait for reviews before opening additional PRs. A large number of concurrent PRs can make reviewing difficult and slow down maintenance.
6. **Respect PR assignments and existing work.** If someone has already been assigned to an issue or has communicated that they are actively working on it, avoid submitting a competing PR without discussing it with the maintainers first.
7. 
