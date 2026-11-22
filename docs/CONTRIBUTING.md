## Contributing to FlashFit

Thank you for your interest in improving FlashFit! Follow this guide to submit bug fixes, features, or architectural enhancements.

### Development Workflow

1. **Fork and Clone**
   ```bash
   git clone https://github.com/<your-username>/FlashFit.git
   cd FlashFit
   ```

2. **Branch Naming Standard**
   - Feature: `feat/<feature-name>`
   - Bugfix: `fix/<issue-description>`
   - Documentation: `docs/<topic>`
   - Performance: `perf/<optimization>`

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Run Local Workspaces**
   ```bash
   npm run dev
   ```
   - Storefront runs on `http://localhost:3000`
   - Admin Operations runs on `http://localhost:3001`
   - Driver Portal runs on `http://localhost:3002`
   - Seller App runs on `http://localhost:3003`

5. **Code Quality and Testing**
   Ensure all packages compile, typecheck, and pass tests before pushing:
   ```bash
   npm run lint
   npm run build
   npm --prefix customer-app/web-customer test
   ```

6. **Submit a Pull Request**
   - Ensure PR title follows Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`.
   - Provide a description of the changes and link related issues.
