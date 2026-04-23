# Navigation Feature

This feature provides a complete hierarchical navigation system (Fields → Categories → Posts) with search functionality and persistent state management.

## Files

- **`types.ts`**: TypeScript interfaces for navigation components
- **`hooks/useNavigationTree.ts`**: Custom hook for fetching and managing navigation tree state
- **`hooks/useNavigationTree.test.ts`**: Unit tests for the navigation hook
- **`components/NavigationNode.tsx`**: Recursive tree node component with expand/collapse animations
- **`components/NavigationNode.test.tsx`**: Unit tests for NavigationNode component
- **`components/NavigationTree.tsx`**: Main container component with search functionality
- **`components/NavigationTree.test.tsx`**: Unit tests for NavigationTree component

## Usage

### Basic Usage with NavigationTree Component

```typescript
import { NavigationTree } from '@/features/navigation/components/NavigationTree';

function Sidebar() {
  return (
    <aside className="w-64 border-r">
      <NavigationTree />
    </aside>
  );
}
```

### With Initial Expanded State

```typescript
function Sidebar() {
  return (
    <NavigationTree 
      initialExpanded={['field-1', 'category-1']}
    />
  );
}
```

### With Custom Node Click Handler

```typescript
function Sidebar() {
  const handleNodeClick = (node) => {
    console.log('Node clicked:', node);
    // Custom logic here
  };

  return (
    <NavigationTree 
      onNodeClick={handleNodeClick}
    />
  );
}
```

### Disable Search

```typescript
function Sidebar() {
  return (
    <NavigationTree 
      searchable={false}
    />
  );
}
```

### Using the Hook Directly

```typescript
import { useNavigationTree } from '@/features/navigation/hooks/useNavigationTree';

function CustomNavigationSidebar() {
  const {
    tree,
    expandedIds,
    toggleNode,
    isLoading,
    error
  } = useNavigationTree();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <nav>
      {tree.map(field => (
        <div key={field.id}>
          <button onClick={() => toggleNode(field.id)}>
            {field.label} ({field.postCount})
          </button>
          {expandedIds.has(field.id) && field.children && (
            <div>
              {field.children.map(category => (
                <div key={category.id}>
                  <button onClick={() => toggleNode(category.id)}>
                    {category.label}
                  </button>
                  {/* Render posts when category is expanded */}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
```

## Features

### ✅ Complete Navigation System
- **NavigationTree**: Main container component with search and state management
- **NavigationNode**: Recursive tree node with expand/collapse animations
- **useNavigationTree**: Hook for data fetching and state management

### ✅ Hierarchical Data Structure
- Three-level tree: Fields → Categories → Posts
- Each node has type, label, slug, URL, and optional children
- Recursive rendering with proper nesting levels

### ✅ Search Functionality (Requirement 1.6)
- Automatically shown when there are more than 10 fields
- Filters fields, categories, and posts by name
- Includes parent nodes when children match
- Clear button to reset search
- No results message when search yields no matches

### ✅ Expansion State Management
- Toggle individual nodes
- Expand/collapse specific nodes
- Expand/collapse all nodes
- Persistent state across page reloads

### ✅ localStorage Persistence
- Automatically saves expansion state to localStorage
- Restores state on component mount
- Handles invalid/corrupted localStorage data gracefully

### ✅ Visual Feedback
- Active state highlighting based on current route
- Smooth expand/collapse animations
- Loading skeleton placeholders
- Error state with retry option
- Post count badges for fields and categories

### ✅ Accessibility
- Semantic HTML with proper ARIA labels
- Keyboard navigation support
- Screen reader friendly
- Focus indicators

### ✅ Error Handling
- Graceful error handling for network failures
- Loading states for async operations
- Type-safe error objects

## Requirements Validation

- **Requirement 1.1**: Display hierarchical tree (Fields → Categories → Posts) ✅
- **Requirement 1.2**: Expand Field to show Categories ✅
- **Requirement 1.3**: Expand Category to show Posts ✅
- **Requirement 1.4**: Navigate to Post detail page on click ✅
- **Requirement 1.5**: Persist expansion state in localStorage ✅
- **Requirement 1.6**: Search input for >10 fields ✅

## API Reference

### `useNavigationTree(initialExpanded?: string[])`

Returns an object with:

| Property | Type | Description |
|----------|------|-------------|
| `tree` | `NavigationNode[]` | The navigation tree data |
| `expandedIds` | `Set<string>` | Set of currently expanded node IDs |
| `toggleNode` | `(nodeId: string) => void` | Toggle expansion state of a node |
| `expandNode` | `(nodeId: string) => void` | Expand a specific node |
| `collapseNode` | `(nodeId: string) => void` | Collapse a specific node |
| `expandAll` | `() => void` | Expand all nodes in the tree |
| `collapseAll` | `() => void` | Collapse all nodes in the tree |
| `isLoading` | `boolean` | Loading state |
| `error` | `Error \| null` | Error state |

### `NavigationTreeProps`

Interface for NavigationTree component props:

```typescript
interface NavigationTreeProps {
  initialExpanded?: string[];
  onNodeClick?: (node: NavigationNode) => void;
  searchable?: boolean;
}
```

### `NavigationNode`

Domain type representing a node in the navigation tree:

```typescript
interface NavigationNode {
  id: string;
  type: 'field' | 'category' | 'post';
  label: string;
  slug: string;
  url: string;
  children?: NavigationNode[];
  postCount?: number;
}
```

## Testing

Run all navigation tests with:

```bash
npm test -- features/navigation
```

Run specific component tests:

```bash
# NavigationTree component
npm test -- features/navigation/components/NavigationTree.test.tsx

# NavigationNode component
npm test -- features/navigation/components/NavigationNode.test.tsx

# useNavigationTree hook
npm test -- features/navigation/hooks/useNavigationTree.test.ts
```

Test coverage includes:
- ✅ Fetching navigation tree data
- ✅ Expansion state management
- ✅ localStorage persistence
- ✅ Search functionality (filtering, clear, no results)
- ✅ Recursive rendering
- ✅ Active state highlighting
- ✅ Animations and transitions
- ✅ Error handling
- ✅ Loading states
- ✅ Accessibility
- ✅ Edge cases (invalid localStorage data, empty trees, etc.)
