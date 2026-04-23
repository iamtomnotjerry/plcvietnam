# Books Feature

This feature provides components and hooks for displaying books and technical documents in the Automation Blog.

## Components

### BookCard

Displays a single book with cover image, title, description, author, and action buttons.

**Props:**
- `book: Book` - The book data to display
- `variant?: 'grid' | 'list'` - Display variant (default: 'grid')

**Features:**
- Grid and list layout variants
- Cover image optimization with Next.js Image
- Description truncation (max 300 characters)
- Series badge display
- Download button for PDF files
- External link button for online resources
- Responsive design

**Example:**
```tsx
import { BookCard } from '@/features/books/components';

<BookCard book={book} variant="grid" />
```

### BookList

Displays a paginated grid of books with optional series grouping.

**Props:**
- `books: Book[]` - Array of books to display
- `groupBySeries?: boolean` - Enable series grouping (default: false)
- `pagination?: PaginationProps` - Pagination configuration

**Features:**
- Responsive grid layout (3 columns desktop, 2 tablet, 1 mobile)
- Series grouping with headings
- Pagination controls
- Empty state handling
- Books without series in separate "Sách khác" section

**Example:**
```tsx
import { BookList } from '@/features/books/components';

<BookList 
  books={books} 
  groupBySeries={true}
  pagination={{
    page: 1,
    totalPages: 3,
    onPageChange: (page) => setPage(page)
  }}
/>
```

## Hooks

### useBooks

Fetches books with pagination and filtering options.

**Parameters:**
- `options?: BookQueryOptions` - Query options
  - `page?: number` - Page number (default: 1)
  - `limit?: number` - Items per page (default: 12)
  - `series?: string` - Filter by series name

**Returns:**
- `books: Book[]` - Array of books
- `loading: boolean` - Loading state
- `error: Error | null` - Error state
- `pagination: PaginationInfo | null` - Pagination metadata

**Example:**
```tsx
import { useBooks } from '@/features/books/hooks/useBooks';

function BooksPage() {
  const { books, loading, error, pagination } = useBooks({ 
    page: 1, 
    limit: 12 
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <BookList books={books} pagination={pagination} />;
}
```

### useFeaturedBooks

Fetches featured books for homepage display.

**Parameters:**
- `limit?: number` - Number of books to fetch (default: 3)

**Returns:**
- `books: Book[]` - Array of featured books
- `loading: boolean` - Loading state
- `error: Error | null` - Error state

**Example:**
```tsx
import { useFeaturedBooks } from '@/features/books/hooks/useBooks';

function FeaturedBooksSection() {
  const { books, loading, error } = useFeaturedBooks(3);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {books.map(book => (
        <BookCard key={book.id} book={book} variant="grid" />
      ))}
    </div>
  );
}
```

## Data Model

```typescript
interface Book {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImageUrl: string;
  authorName: string;
  series?: string;
  downloadUrl?: string;
  externalUrl?: string;
  publishedYear?: number;
  createdAt: Date;
}
```

## Requirements Validation

This feature validates the following requirements:

- **5.1**: Dedicated Books page accessible from main navigation
- **5.2**: Display cover image, title, description (max 300 chars), author name, download/external link
- **5.3**: Click on book navigates to detail or opens external link in new tab
- **5.4**: Group books by series when enabled
- **5.5**: Pagination with 12 books per page

## Testing

Run tests with:
```bash
npm test features/books
```

Test coverage includes:
- BookCard component (grid and list variants)
- BookList component (grouping, pagination, empty state)
- useBooks hook (fetching, error handling, refetching)
- useFeaturedBooks hook (fetching, error handling)
