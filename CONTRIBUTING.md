# 🤝 Contributing to PLC Việt Nam

Cảm ơn bạn đã quan tâm đến việc đóng góp cho PLC Việt Nam! Tài liệu này sẽ hướng dẫn bạn quy trình đóng góp.

## 📋 Mục lục

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)

---

## 📜 Code of Conduct

Dự án này tuân thủ [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/). Bằng việc tham gia, bạn đồng ý tuân thủ các quy tắc này.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ và npm/yarn/pnpm
- Git
- Code editor (VS Code khuyến nghị)

### Setup

1. Fork repository
2. Clone fork của bạn:

   ```bash
   git clone https://github.com/YOUR_USERNAME/automation-blog.git
   cd automation-blog
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

5. Start development server:

   ```bash
   npm run dev
   ```

6. Open http://localhost:3000

---

## 💻 Development Workflow

### Branch Naming

- `feature/` - Tính năng mới (vd: `feature/add-newsletter`)
- `fix/` - Bug fixes (vd: `fix/navbar-mobile-theme`)
- `docs/` - Documentation (vd: `docs/update-readme`)
- `refactor/` - Code refactoring (vd: `refactor/post-card-component`)
- `test/` - Tests (vd: `test/add-post-card-tests`)
- `chore/` - Maintenance (vd: `chore/update-dependencies`)

### Workflow

1. Create a new branch:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Run tests:

   ```bash
   npm run test
   ```

4. Run linter:

   ```bash
   npm run lint
   ```

5. Commit your changes (see [Commit Guidelines](#commit-guidelines))

6. Push to your fork:

   ```bash
   git push origin feature/your-feature-name
   ```

7. Create a Pull Request

---

## 📝 Coding Standards

### TypeScript

- **Strict mode enabled** - Tất cả code phải pass TypeScript strict checks
- **No `any` types** - Sử dụng proper types hoặc `unknown`
- **Explicit return types** - Cho functions và methods
- **Interface over type** - Ưu tiên `interface` cho object shapes

### React

- **Functional components** - Không dùng class components
- **Hooks** - Sử dụng React hooks
- **Server Components** - Ưu tiên Server Components khi có thể
- **Client Components** - Chỉ khi cần interactivity

### File Structure

```
features/
  feature-name/
    components/
      ComponentName.tsx
      ComponentName.test.tsx
    hooks/
      useHookName.ts
      useHookName.test.ts
    utils/
      utilityName.ts
      utilityName.test.ts
    types.ts
    README.md
```

### Naming Conventions

- **Components**: PascalCase (vd: `PostCard.tsx`)
- **Hooks**: camelCase với prefix `use` (vd: `useSearch.ts`)
- **Utils**: camelCase (vd: `readingTime.ts`)
- **Types**: PascalCase (vd: `Post`, `Author`)
- **Constants**: UPPER_SNAKE_CASE (vd: `MAX_POSTS_PER_PAGE`)

### CSS/Styling

- **Tailwind CSS** - Sử dụng utility classes
- **CSS Variables** - Cho theme colors
- **No inline styles** - Trừ khi absolutely necessary
- **Responsive** - Mobile-first approach
- **Dark mode** - Support cả light và dark mode

---

## 📝 Commit Guidelines

Chúng tôi sử dụng [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: Tính năng mới
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(posts): add reading progress indicator

Add a reading progress bar at the top of post detail pages
that shows how much of the article has been read.

Closes #123
```

```bash
fix(navbar): fix mobile theme toggle color

Update ThemeToggle component to use theme variables
instead of hardcoded colors for better dark mode support.

Fixes #456
```

---

## 🔄 Pull Request Process

### Before Submitting

- [ ] Code follows coding standards
- [ ] All tests pass (`npm run test`)
- [ ] Linter passes (`npm run lint`)
- [ ] No TypeScript errors
- [ ] Added tests for new features
- [ ] Updated documentation if needed
- [ ] Tested in both light and dark mode
- [ ] Tested on mobile and desktop

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

How to test these changes

## Screenshots (if applicable)

Add screenshots for UI changes

## Checklist

- [ ] Tests pass
- [ ] Linter passes
- [ ] Documentation updated
- [ ] Responsive design tested
- [ ] Dark mode tested
```

### Review Process

1. Maintainer sẽ review PR của bạn
2. Có thể có feedback hoặc yêu cầu changes
3. Sau khi approved, PR sẽ được merge
4. Branch sẽ được delete sau khi merge

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

### Writing Tests

#### Unit Tests

```typescript
import { describe, it, expect } from 'vitest';
import { calculateReadingTime } from './readingTime';

describe('calculateReadingTime', () => {
  it('should calculate reading time correctly', () => {
    const content = 'Lorem ipsum '.repeat(200); // 400 words
    const result = calculateReadingTime(content);
    expect(result).toBe(2); // 400 / 200 = 2 minutes
  });
});
```

#### Property-Based Tests

```typescript
import { describe, it } from 'vitest';
import fc from 'fast-check';

describe('Property: Reading Time Calculation', () => {
  it('should always return at least 1 minute', () => {
    fc.assert(
      fc.property(fc.string(), (content) => {
        const result = calculateReadingTime(content);
        return result >= 1;
      })
    );
  });
});
```

#### Component Tests

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PostCard } from './PostCard';

describe('PostCard', () => {
  it('should render post title', () => {
    const post = { title: 'Test Post', /* ... */ };
    render(<PostCard post={post} />);
    expect(screen.getByText('Test Post')).toBeInTheDocument();
  });
});
```

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vitest Documentation](https://vitest.dev)

---

## 🙏 Thank You!

Cảm ơn bạn đã đóng góp cho PLC Việt Nam! Mọi đóng góp, dù lớn hay nhỏ, đều được đánh giá cao.

Nếu có câu hỏi, vui lòng tạo issue hoặc liên hệ maintainers.

Happy coding! 🚀
