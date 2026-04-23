# Homepage Feature

This feature contains all components for the blog homepage.

## Components

### HeroSection

Displays the hero section with blog title, tagline, description, and CTA button.

**Props:**
- `title`: Blog title
- `tagline`: Blog tagline (e.g., "Chia sẻ kiến thức tự động hóa công nghiệp")
- `description`: Brief description of blog focus area

**Validates:** Requirements 11.2

### RecentPostsSection

Displays the 6 most recent posts in a grid layout.

**Props:**
- `posts`: Array of Post objects (displays maximum 6)

**Features:**
- Grid layout (3 columns on desktop, 2 on tablet, 1 on mobile)
- Uses PostCard component with 'compact' variant
- Shows category, publication date, and reading time

**Validates:** Requirements 11.3

### FieldsSection

Displays all fields with post counts in a grid layout.

**Props:**
- `fields`: Array of Field objects

**Features:**
- Grid layout (3 columns on desktop, 2 on tablet, 1 on mobile)
- Shows field name, description, icon, and post count
- Links to field pages

**Validates:** Requirements 11.4

### FeaturedBooksSection

Displays 3 featured books in a grid layout.

**Props:**
- `books`: Array of Book objects (displays maximum 3)

**Features:**
- Grid layout (3 columns on desktop, 2 on tablet, 1 on mobile)
- Uses BookCard component with 'grid' variant
- Link to books page

**Validates:** Requirements 11.5

## Usage

```tsx
import {
  HeroSection,
  RecentPostsSection,
  FieldsSection,
  FeaturedBooksSection,
} from '@/features/homepage/components';

export default function HomePage() {
  return (
    <>
      <HeroSection
        title="Automation Blog"
        tagline="Chia sẻ kiến thức tự động hóa công nghiệp"
        description="Khám phá kiến thức về PLC, SCADA, và Siemens Automation"
      />
      <RecentPostsSection posts={recentPosts} />
      <FieldsSection fields={fields} />
      <FeaturedBooksSection books={featuredBooks} />
    </>
  );
}
```

## Testing

All components have comprehensive unit tests covering:
- Rendering of all elements
- Correct props handling
- Edge cases (empty data, maximum limits)
- Accessibility (semantic HTML, ARIA labels)

Run tests:
```bash
npm test features/homepage/components
```
