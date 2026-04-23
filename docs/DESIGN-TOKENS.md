# Design Tokens Documentation

Tài liệu này mô tả hệ thống design tokens được sử dụng trong Automation Blog.

## 📋 Mục lục

- [Colors](#colors)
- [Typography](#typography)
- [Spacing](#spacing)
- [Border Radius](#border-radius)
- [Shadows](#shadows)
- [Breakpoints](#breakpoints)
- [Z-Index](#z-index)

---

## 🎨 Colors

### CSS Variables

Tất cả màu sắc được định nghĩa trong `app/globals.css` sử dụng HSL color space để dễ dàng điều chỉnh.

#### Light Mode

```css
--background: 40 20% 97%; /* Stone-50 - #F9F8F6 */
--foreground: 215 25% 15%; /* Slate-900 - #0F172A */

--card: 0 0% 100%; /* White - #FFFFFF */
--card-foreground: 215 25% 15%; /* Slate-900 - #0F172A */

--primary: 173 58% 39%; /* Teal-600 - #0D9488 */
--primary-foreground: 0 0% 100%; /* White - #FFFFFF */

--secondary: 215 20% 65%; /* Slate-400 - #94A3B8 */
--secondary-foreground: 215 25% 15%; /* Slate-900 - #0F172A */

--muted: 40 10% 90%; /* Stone-200 - #E7E5E4 */
--muted-foreground: 215 16% 47%; /* Slate-600 - #475569 */

--accent: 38 92% 50%; /* Amber-500 - #F59E0B */
--accent-foreground: 0 0% 100%; /* White - #FFFFFF */

--destructive: 0 84% 60%; /* Red-500 - #EF4444 */
--destructive-foreground: 0 0% 100%; /* White - #FFFFFF */

--border: 40 10% 85%; /* Stone-300 - #D6D3D1 */
--input: 40 10% 85%; /* Stone-300 - #D6D3D1 */
--ring: 173 58% 39%; /* Teal-600 - #0D9488 */
```

#### Dark Mode

```css
--background: 215 28% 10%; /* Slate-950 - #020617 */
--foreground: 40 20% 97%; /* Stone-50 - #F9F8F6 */

--card: 215 25% 15%; /* Slate-900 - #0F172A */
--card-foreground: 40 20% 97%; /* Stone-50 - #F9F8F6 */

--primary: 172 66% 50%; /* Teal-400 - #2DD4BF */
--primary-foreground: 215 28% 10%; /* Slate-950 - #020617 */

--secondary: 215 20% 35%; /* Slate-700 - #334155 */
--secondary-foreground: 40 20% 97%; /* Stone-50 - #F9F8F6 */

--muted: 215 25% 20%; /* Slate-800 - #1E293B */
--muted-foreground: 215 20% 65%; /* Slate-400 - #94A3B8 */

--accent: 38 92% 50%; /* Amber-500 - #F59E0B */
--accent-foreground: 215 28% 10%; /* Slate-950 - #020617 */

--destructive: 0 84% 60%; /* Red-500 - #EF4444 */
--destructive-foreground: 0 0% 100%; /* White - #FFFFFF */

--border: 215 25% 20%; /* Slate-800 - #1E293B */
--input: 215 25% 20%; /* Slate-800 - #1E293B */
--ring: 172 66% 50%; /* Teal-400 - #2DD4BF */
```

### Tailwind Classes

Sử dụng các utility classes sau để áp dụng màu sắc:

```tsx
// Background
<div className="bg-background" />
<div className="bg-card" />
<div className="bg-primary" />
<div className="bg-muted" />

// Text
<p className="text-foreground" />
<p className="text-muted-foreground" />
<p className="text-primary" />

// Border
<div className="border-border" />
<div className="border-primary" />

// Ring (focus states)
<input className="ring-ring" />
```

---

## 📝 Typography

### Font Families

```tsx
// Sans-serif (body text)
--font-sans: 'Plus Jakarta Sans', sans-serif;

// Serif (headings)
--font-serif: 'Lora', serif;
```

### Font Sizes

```css
/* Tailwind default scale */
text-xs:   0.75rem  (12px)
text-sm:   0.875rem (14px)
text-base: 1rem     (16px)
text-lg:   1.125rem (18px)
text-xl:   1.25rem  (20px)
text-2xl:  1.5rem   (24px)
text-3xl:  1.875rem (30px)
text-4xl:  2.25rem  (36px)
text-5xl:  3rem     (48px)
```

### Font Weights

```css
font-normal:    400
font-medium:    500
font-semibold:  600
font-bold:      700
```

### Line Heights

```css
leading-none:     1
leading-tight:    1.25
leading-snug:     1.375
leading-normal:   1.5
leading-relaxed:  1.625
leading-loose:    2
```

### Usage Examples

```tsx
// Headings (serif)
<h1 className="font-serif text-4xl font-bold">Heading 1</h1>
<h2 className="font-serif text-3xl font-semibold">Heading 2</h2>
<h3 className="font-serif text-2xl font-semibold">Heading 3</h3>

// Body text (sans)
<p className="text-base leading-relaxed">Body text</p>
<p className="text-sm text-muted-foreground">Caption text</p>
```

---

## 📏 Spacing

Sử dụng Tailwind spacing scale (4px base unit):

```css
0:    0px
0.5:  2px
1:    4px
1.5:  6px
2:    8px
2.5:  10px
3:    12px
3.5:  14px
4:    16px
5:    20px
6:    24px
7:    28px
8:    32px
10:   40px
12:   48px
16:   64px
20:   80px
24:   96px
```

### Common Patterns

```tsx
// Container padding
<div className="px-4 py-8" />

// Card spacing
<div className="p-6 space-y-4" />

// Section spacing
<section className="mb-12" />

// Gap in grids
<div className="grid gap-6" />
```

---

## 🔲 Border Radius

```css
rounded-none:  0px
rounded-sm:    2px
rounded:       4px
rounded-md:    6px
rounded-lg:    8px
rounded-xl:    12px
rounded-2xl:   16px
rounded-3xl:   24px
rounded-full:  9999px
```

### Usage

```tsx
// Cards
<div className="rounded-lg" />

// Buttons
<button className="rounded-lg" />

// Avatars
<img className="rounded-full" />

// Images
<img className="rounded-xl" />
```

---

## 🌑 Shadows

```css
shadow-sm:   0 1px 2px 0 rgb(0 0 0 / 0.05)
shadow:      0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
shadow-md:   0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
shadow-lg:   0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
shadow-xl:   0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)
shadow-2xl:  0 25px 50px -12px rgb(0 0 0 / 0.25)
```

### Usage

```tsx
// Cards
<div className="shadow-md" />

// Elevated elements
<div className="shadow-lg" />

// Modals
<div className="shadow-2xl" />
```

---

## 📱 Breakpoints

```css
sm:   640px   /* Small devices (landscape phones) */
md:   768px   /* Medium devices (tablets) */
lg:   1024px  /* Large devices (desktops) */
xl:   1280px  /* Extra large devices (large desktops) */
2xl:  1536px  /* 2X large devices (larger desktops) */
```

### Mobile-First Approach

```tsx
// Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" />

// Mobile: full width, Desktop: max-width
<div className="w-full lg:max-w-7xl mx-auto" />

// Hide on mobile, show on desktop
<div className="hidden lg:block" />

// Show on mobile, hide on desktop
<div className="block lg:hidden" />
```

---

## 🔢 Z-Index

Sử dụng z-index scale nhất quán:

```css
z-0:    0
z-10:   10   /* Elevated content */
z-20:   20   /* Dropdowns */
z-30:   30   /* Fixed headers */
z-40:   40   /* Overlays */
z-50:   50   /* Modals */
z-auto: auto
```

### Usage

```tsx
// Fixed header
<header className="fixed top-0 z-30" />

// Dropdown menu
<div className="absolute z-20" />

// Modal backdrop
<div className="fixed inset-0 z-40 bg-black/50" />

// Modal content
<div className="fixed z-50" />
```

---

## 🎯 Component Patterns

### Card

```tsx
<div className="bg-card border border-border rounded-lg p-6 shadow-md">
  <h3 className="font-serif text-xl font-semibold mb-2">Card Title</h3>
  <p className="text-muted-foreground">Card content</p>
</div>
```

### Button Primary

```tsx
<button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
  Button
</button>
```

### Button Secondary

```tsx
<button className="bg-card border border-border text-foreground px-4 py-2 rounded-lg font-medium hover:bg-muted transition-colors">
  Button
</button>
```

### Input

```tsx
<input className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring" />
```

### Badge

```tsx
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
  Badge
</span>
```

---

## 📚 Best Practices

### 1. Always Use Theme Variables

❌ **Don't:**

```tsx
<div className="bg-white dark:bg-slate-900" />
```

✅ **Do:**

```tsx
<div className="bg-background" />
```

### 2. Consistent Spacing

❌ **Don't:**

```tsx
<div className="mb-3 mt-5 px-7" />
```

✅ **Do:**

```tsx
<div className="mb-4 mt-6 px-8" />
```

### 3. Mobile-First Responsive

❌ **Don't:**

```tsx
<div className="lg:grid-cols-3 md:grid-cols-2 grid-cols-1" />
```

✅ **Do:**

```tsx
<div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" />
```

### 4. Semantic Color Usage

❌ **Don't:**

```tsx
<button className="bg-red-500">Delete</button>
```

✅ **Do:**

```tsx
<button className="bg-destructive text-destructive-foreground">Delete</button>
```

---

## 🔄 Updating Tokens

Để thay đổi design tokens:

1. Cập nhật CSS variables trong `app/globals.css`
2. Test cả light mode và dark mode
3. Kiểm tra contrast ratio (WCAG AA: 4.5:1 minimum)
4. Update documentation này nếu cần

---

**Cập nhật lần cuối:** ${new Date().toLocaleDateString('vi-VN')}
