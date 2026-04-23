# 🐶 Husky Git Hooks Setup

Tài liệu này mô tả cấu hình Git hooks sử dụng Husky trong project.

---

## 📋 Tổng quan

Husky được sử dụng để tự động chạy các checks trước khi commit và push code, đảm bảo code quality và consistency.

### Hooks đã cấu hình:

1. **pre-commit** - Chạy trước khi commit
2. **commit-msg** - Validate commit message format
3. **pre-push** - Chạy trước khi push

---

## 🔧 Cài đặt

Husky đã được cài đặt và cấu hình sẵn. Khi clone project:

```bash
npm install
```

Husky sẽ tự động được setup thông qua `prepare` script.

---

## 🪝 Git Hooks

### 1. Pre-commit Hook

**File:** `.husky/pre-commit`

**Chức năng:**

- Chạy `lint-staged` để format và lint code
- Chạy `type-check` để kiểm tra TypeScript errors

**Các bước thực hiện:**

```bash
# 1. Lint và format staged files
npx lint-staged

# 2. Type check toàn bộ project
npm run type-check
```

**Lint-staged config** (trong `package.json`):

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

**Kết quả:**

- ✅ Code được auto-format với Prettier
- ✅ ESLint errors được auto-fix
- ✅ TypeScript errors được phát hiện trước khi commit
- ❌ Commit bị block nếu có TypeScript errors

---

### 2. Commit-msg Hook

**File:** `.husky/commit-msg`

**Chức năng:**

- Validate commit message format theo Conventional Commits

**Format yêu cầu:**

```
type(scope): subject

# Types:
- feat:     Tính năng mới
- fix:      Bug fix
- docs:     Documentation changes
- style:    Code style changes (formatting, etc.)
- refactor: Code refactoring
- test:     Test changes
- chore:    Build process, dependencies, etc.
- perf:     Performance improvements
- ci:       CI/CD changes
- build:    Build system changes
- revert:   Revert previous commit
```

**Ví dụ hợp lệ:**

```bash
✅ feat(auth): add login page
✅ fix(ui): resolve mobile menu bug
✅ docs: update README
✅ refactor(api): simplify error handling
✅ test(posts): add unit tests for PostCard
✅ chore(deps): update dependencies
```

**Ví dụ không hợp lệ:**

```bash
❌ added login page
❌ fix bug
❌ update
❌ WIP
```

**Kết quả:**

- ✅ Commit message format nhất quán
- ✅ Dễ dàng generate changelog
- ✅ Dễ dàng filter commits theo type
- ❌ Commit bị block nếu format sai

---

### 3. Pre-push Hook

**File:** `.husky/pre-push`

**Chức năng:**

- Chạy tất cả tests trước khi push

**Các bước thực hiện:**

```bash
# Run all tests
npm run test
```

**Kết quả:**

- ✅ Đảm bảo tests pass trước khi push
- ✅ Tránh push broken code lên remote
- ❌ Push bị block nếu tests fail

---

## 🚀 Workflow

### Khi commit code:

```bash
git add .
git commit -m "feat(posts): add related posts section"
```

**Husky sẽ tự động:**

1. ✅ Format code với Prettier
2. ✅ Fix ESLint errors
3. ✅ Check TypeScript types
4. ✅ Validate commit message format
5. ✅ Commit nếu tất cả pass

### Khi push code:

```bash
git push origin main
```

**Husky sẽ tự động:**

1. ✅ Run all tests
2. ✅ Push nếu tests pass
3. ❌ Block push nếu tests fail

---

## 🛠️ Bypass Hooks (Không khuyến khích)

Trong trường hợp khẩn cấp, có thể bypass hooks:

```bash
# Bypass pre-commit và commit-msg
git commit -m "message" --no-verify

# Bypass pre-push
git push --no-verify
```

**⚠️ Cảnh báo:** Chỉ sử dụng khi thực sự cần thiết!

---

## 📝 Thêm Hook mới

Để thêm hook mới:

```bash
# Tạo file hook
echo '#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Your commands here
' > .husky/hook-name

# Make it executable (Linux/Mac)
chmod +x .husky/hook-name
```

---

## 🔍 Troubleshooting

### Hook không chạy

```bash
# Reinstall Husky
npm run prepare
```

### Permission denied (Linux/Mac)

```bash
# Make hooks executable
chmod +x .husky/*
```

### Hook chạy chậm

- Xem xét giảm số lượng files được check
- Sử dụng `lint-staged` thay vì lint toàn bộ project
- Cache TypeScript compilation

---

## 📊 Benefits

### Code Quality

- ✅ Consistent code formatting
- ✅ No ESLint errors
- ✅ No TypeScript errors
- ✅ All tests passing

### Team Collaboration

- ✅ Consistent commit messages
- ✅ Easy to generate changelog
- ✅ Easy to review commits
- ✅ Prevent broken code in remote

### Developer Experience

- ✅ Auto-format on commit
- ✅ Catch errors early
- ✅ No manual checks needed
- ✅ Fast feedback loop

---

## 📚 Resources

- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Cập nhật lần cuối:** ${new Date().toLocaleDateString('vi-VN')}
