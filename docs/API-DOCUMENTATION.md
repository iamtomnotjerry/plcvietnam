# 📚 API Documentation

## Overview

This document provides comprehensive documentation for all API endpoints in the PLC Vietnam Blog application.

**Base URL**: `https://your-domain.com/api`

**Authentication**: Most admin endpoints require authentication via NextAuth session.

**Rate Limiting**:

- Auth endpoints: 5 requests per 15 minutes
- API endpoints: 30 requests per minute
- Comment endpoints: 10 requests per minute

---

## 🔐 Authentication

### POST /api/auth/register

Register a new user account.

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "Password123",
  "full_name": "John Doe"
}
```

**Validation**:

- Email: Valid email format, max 255 characters
- Password: Min 8 characters, must contain uppercase, lowercase, and number
- Full Name: Min 1 character, max 200 characters

**Response** (201 Created):

```json
{
  "message": "Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản.",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "reader"
  }
}
```

**Error Responses**:

- `400`: Validation error
- `409`: Email already exists
- `429`: Rate limit exceeded

---

### POST /api/auth/forgot-password

Request password reset email.

**Request Body**:

```json
{
  "email": "user@example.com"
}
```

**Response** (200 OK):

```json
{
  "message": "Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu."
}
```

**Error Responses**:

- `400`: Invalid email format
- `429`: Rate limit exceeded

---

### POST /api/auth/reset-password

Reset password using token from email.

**Request Body**:

```json
{
  "access_token": "token-from-email",
  "refresh_token": "refresh-token-from-email",
  "password": "NewPassword123"
}
```

**Response** (200 OK):

```json
{
  "message": "Mật khẩu đã được đặt lại thành công."
}
```

**Error Responses**:

- `400`: Invalid token or weak password
- `401`: Token expired
- `429`: Rate limit exceeded

---

## 📝 Posts

### GET /api/posts

Get published posts with pagination.

**Query Parameters**:

- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 20, max 100
- `category_id` (optional): Filter by category UUID
- `tag_id` (optional): Filter by tag UUID
- `search` (optional): Search query, max 200 characters

**Response** (200 OK):

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Post Title",
      "slug": "post-title",
      "excerpt": "Post excerpt...",
      "thumbnail_url": "https://...",
      "published_at": "2026-04-27T00:00:00Z",
      "view_count": 100,
      "category": {
        "id": "uuid",
        "name": "Category Name",
        "slug": "category-slug"
      },
      "author": {
        "id": "uuid",
        "full_name": "Author Name",
        "avatar_url": "https://..."
      },
      "tags": [
        {
          "id": "uuid",
          "name": "Tag Name",
          "slug": "tag-slug"
        }
      ]
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

---

### GET /api/posts/[slug]

Get single post by slug.

**Response** (200 OK):

```json
{
  "id": "uuid",
  "title": "Post Title",
  "slug": "post-title",
  "content": "Full post content...",
  "excerpt": "Post excerpt...",
  "thumbnail_url": "https://...",
  "published_at": "2026-04-27T00:00:00Z",
  "view_count": 100,
  "meta_title": "SEO Title",
  "meta_description": "SEO Description",
  "category": { ... },
  "author": { ... },
  "tags": [ ... ]
}
```

**Error Responses**:

- `404`: Post not found

---

### POST /api/posts/[id]/view

Increment post view count.

**Response** (200 OK):

```json
{
  "success": true
}
```

---

## 🔒 Admin - Posts

### POST /api/admin/posts

Create a new post (Admin/Author only).

**Authentication**: Required (Admin or Author role)

**Request Body**:

```json
{
  "title": "Post Title",
  "slug": "post-title",
  "excerpt": "Post excerpt...",
  "content": "Full post content...",
  "thumbnail_url": "https://...",
  "category_id": "uuid",
  "status": "draft",
  "published_at": "2026-04-27T00:00:00Z",
  "meta_title": "SEO Title",
  "meta_description": "SEO Description",
  "tag_ids": ["uuid1", "uuid2"]
}
```

**Validation**:

- Title: Min 1 char, max 500 chars
- Slug: Lowercase, numbers, hyphens only, max 200 chars
- Content: Min 1 char
- Status: One of 'draft', 'published', 'archived'
- Category ID: Valid UUID
- Tag IDs: Array of valid UUIDs

**Response** (201 Created):

```json
{
  "id": "uuid",
  "title": "Post Title",
  "slug": "post-title",
  ...
}
```

**Error Responses**:

- `400`: Validation error
- `401`: Not authenticated
- `403`: Insufficient permissions
- `409`: Slug already exists
- `429`: Rate limit exceeded

---

### PUT /api/admin/posts/[id]

Update existing post (Admin/Author only).

**Authentication**: Required (Admin or Author role, must be post author)

**Request Body**: Same as POST, all fields optional

**Response** (200 OK):

```json
{
  "id": "uuid",
  "title": "Updated Title",
  ...
}
```

**Error Responses**:

- `400`: Validation error
- `401`: Not authenticated
- `403`: Not post author
- `404`: Post not found
- `409`: Slug already exists
- `429`: Rate limit exceeded

---

### DELETE /api/admin/posts/[id]

Delete post (Admin only).

**Authentication**: Required (Admin role)

**Response** (200 OK):

```json
{
  "message": "Post deleted successfully"
}
```

**Error Responses**:

- `401`: Not authenticated
- `403`: Not admin
- `404`: Post not found

---

### GET /api/admin/posts

Get all posts including drafts (Admin/Author only).

**Authentication**: Required (Admin or Author role)

**Query Parameters**: Same as public GET /api/posts, plus:

- `status` (optional): Filter by status ('draft', 'published', 'archived')
- `author_id` (optional): Filter by author UUID

**Response**: Same as public GET /api/posts

---

## 📚 Books

### GET /api/books

Get published books with pagination.

**Query Parameters**:

- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 20, max 100
- `author_id` (optional): Filter by author UUID
- `is_featured` (optional): Filter featured books (true/false)
- `search` (optional): Search query, max 200 characters

**Response** (200 OK):

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Book Title",
      "slug": "book-title",
      "description": "Book description...",
      "cover_url": "https://...",
      "published_at": "2026-04-27T00:00:00Z",
      "is_featured": true,
      "download_url": "https://...",
      "page_count": 300,
      "file_size": "5.2 MB",
      "author": {
        "id": "uuid",
        "name": "Author Name",
        "slug": "author-slug"
      }
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

---

### GET /api/books/featured

Get featured books.

**Response** (200 OK):

```json
{
  "data": [ ... ]
}
```

---

## 💬 Comments

### GET /api/comments

Get comments for a post.

**Query Parameters**:

- `post_id` (required): Post UUID
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 20, max 100

**Response** (200 OK):

```json
{
  "data": [
    {
      "id": "uuid",
      "content": "Comment content...",
      "created_at": "2026-04-27T00:00:00Z",
      "status": "approved",
      "user": {
        "id": "uuid",
        "full_name": "User Name",
        "avatar_url": "https://..."
      },
      "replies": [ ... ]
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

---

### POST /api/comments

Create a new comment (Authenticated users only).

**Authentication**: Required

**Request Body**:

```json
{
  "post_id": "uuid",
  "content": "Comment content...",
  "parent_id": "uuid" // Optional, for replies
}
```

**Validation**:

- Content: Min 1 char, max 2000 chars
- Post ID: Valid UUID
- Parent ID: Valid UUID (optional)

**Response** (201 Created):

```json
{
  "id": "uuid",
  "content": "Comment content...",
  "status": "pending",
  ...
}
```

**Error Responses**:

- `400`: Validation error
- `401`: Not authenticated
- `429`: Rate limit exceeded (10 requests per minute)

---

## 🔍 Search

### GET /api/search

Search across posts and books.

**Query Parameters**:

- `q` (required): Search query, min 1 char, max 200 chars
- `type` (optional): Search type ('posts', 'books', 'all'), default 'all'
- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 20, max 50

**Response** (200 OK):

```json
{
  "posts": {
    "data": [ ... ],
    "total": 10
  },
  "books": {
    "data": [ ... ],
    "total": 5
  },
  "total": 15
}
```

---

## 🏷️ Tags

### GET /api/tags

Get all tags.

**Response** (200 OK):

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Tag Name",
      "slug": "tag-slug",
      "description": "Tag description...",
      "post_count": 10
    }
  ]
}
```

---

### GET /api/tags/[slug]

Get tag by slug.

**Response** (200 OK):

```json
{
  "id": "uuid",
  "name": "Tag Name",
  "slug": "tag-slug",
  "description": "Tag description...",
  "post_count": 10
}
```

---

### GET /api/tags/[slug]/posts

Get posts for a tag.

**Query Parameters**:

- `page` (optional): Page number, default 1
- `limit` (optional): Items per page, default 20, max 100

**Response**: Same as GET /api/posts

---

## 🗂️ Categories & Fields

### GET /api/navigation

Get navigation tree (fields → categories).

**Response** (200 OK):

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Field Name",
      "slug": "field-slug",
      "categories": [
        {
          "id": "uuid",
          "name": "Category Name",
          "slug": "category-slug",
          "post_count": 10
        }
      ]
    }
  ]
}
```

---

## 📤 File Upload

### POST /api/admin/upload

Upload image file (Admin/Author only).

**Authentication**: Required (Admin or Author role)

**Request**: multipart/form-data

- `file`: Image file (max 5MB, jpg/png/webp)

**Response** (200 OK):

```json
{
  "url": "https://your-supabase-url/storage/v1/object/public/images/filename.jpg"
}
```

**Error Responses**:

- `400`: Invalid file type or size
- `401`: Not authenticated
- `403`: Insufficient permissions
- `429`: Rate limit exceeded

---

## 🚨 Error Responses

All endpoints follow consistent error response format:

```json
{
  "error": "Error message in Vietnamese",
  "details": {
    "field": "Specific field error"
  }
}
```

**Common HTTP Status Codes**:

- `400`: Bad Request (validation error)
- `401`: Unauthorized (not authenticated)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate resource)
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error

---

## 🔒 Rate Limiting

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 29
X-RateLimit-Reset: 1714176000
```

When rate limit is exceeded:

```json
{
  "error": "Too many requests",
  "retryAfter": 60
}
```

---

## 🧪 Testing

### Example cURL Requests

**Register User**:

```bash
curl -X POST https://your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123",
    "full_name": "Test User"
  }'
```

**Get Posts**:

```bash
curl https://your-domain.com/api/posts?page=1&limit=10
```

**Create Post** (requires authentication):

```bash
curl -X POST https://your-domain.com/api/admin/posts \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-session-token" \
  -d '{
    "title": "Test Post",
    "slug": "test-post",
    "content": "Test content",
    "category_id": "uuid"
  }'
```

---

**Last Updated**: 2026-04-27
**API Version**: 1.0.0
