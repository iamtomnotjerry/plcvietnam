# Requirements Document: Blog UI Redesign

## Introduction

This document specifies requirements for redesigning the Automation Blog UI/UX with a professional Swiss Modernism 2.0 design system. The redesign addresses current navigation issues, improves visual design quality, implements Framer Motion animations, and establishes a comprehensive design system with Fira Sans/Fira Code typography, industrial color palette, and 12-column grid layout.

## Glossary

- **Navigation_Bar**: Horizontal navigation component at the top of the page containing logo, menu links, search, and user controls
- **Sidebar**: Collapsible vertical panel displaying hierarchical content tree (Fields → Categories → Posts)
- **Hero_Section**: Primary landing section with value proposition, tagline, and call-to-action
- **Design_System**: Comprehensive set of design tokens including colors, typography, spacing, and component patterns
- **Grid_System**: 12-column layout system with mathematical spacing based on 8px base unit
- **Animation_System**: Framer Motion-based transitions and interactions
- **Post_Card**: Component displaying post summary with title, excerpt, metadata, and thumbnail
- **Book_Card**: Component displaying book information with cover, title, author, and action buttons
- **Field_Card**: Component displaying field overview with name, description, and post count
- **Theme_Toggle**: Control for switching between light and dark color modes
- **Search_Bar**: Input component for searching posts, books, and content
- **User_Auth_UI**: Authentication interface for Google Sign-In and user profile display
- **Mobile_Menu**: Hamburger menu and drawer for mobile navigation
- **Typography_System**: Font hierarchy using Fira Sans and Fira Code with defined sizes and weights
- **Color_Palette**: Industrial-themed color scheme with primary (#64748B), secondary (#94A3B8), CTA (#F97316), and supporting colors
- **Responsive_Breakpoint**: Screen width threshold where layout adapts (375px, 768px, 1024px, 1440px)

## Requirements

### Requirement 1: Horizontal Navigation Bar

**User Story:** As a user, I want a professional horizontal navigation bar at the top of the page, so that I can easily access all sections of the blog.

#### Acceptance Criteria

1. THE Navigation_Bar SHALL display horizontally at the top of all pages
2. THE Navigation_Bar SHALL contain a logo, Home link, Lĩnh vực dropdown, Bài viết link, Sách link, and Giới thiệu link
3. THE Navigation_Bar SHALL include an integrated Search_Bar component
4. THE Navigation_Bar SHALL display a Theme_Toggle control
5. THE Navigation_Bar SHALL display User_Auth_UI for authentication status
6. WHILE the user scrolls down, THE Navigation_Bar SHALL remain sticky at the top with backdrop blur effect
7. WHEN the viewport width is less than 768px, THE Navigation_Bar SHALL display a Mobile_Menu button
8. THE Navigation_Bar SHALL use the Color_Palette with background color #F8FAFC in light mode
9. THE Navigation_Bar SHALL use the Color_Palette with background color #0F172A in dark mode
10. THE Navigation_Bar SHALL apply backdrop-filter blur when sticky
11. FOR ALL clickable elements in Navigation_Bar, THE system SHALL display cursor-pointer
12. THE Navigation_Bar SHALL transition colors smoothly over 200 milliseconds when theme changes

### Requirement 2: Collapsible Sidebar Content Tree

**User Story:** As a user, I want a collapsible sidebar showing the content hierarchy, so that I can browse posts by field and category without the sidebar taking excessive space.

#### Acceptance Criteria

1. THE Sidebar SHALL display on post detail pages and category pages only
2. THE Sidebar SHALL NOT display on homepage, books page, or about page
3. THE Sidebar SHALL contain a toggle button to collapse and expand
4. WHEN the Sidebar is collapsed, THE Sidebar SHALL display only icons with tooltips
5. WHEN the Sidebar is expanded, THE Sidebar SHALL display the full hierarchical tree (Fields → Categories → Posts)
6. THE Sidebar SHALL use Framer Motion for expand and collapse animations with 300 millisecond duration
7. WHEN the viewport width is less than 768px, THE Sidebar SHALL be hidden and content accessible via Mobile_Menu
8. THE Sidebar SHALL persist collapse state in browser localStorage
9. THE Sidebar SHALL use the Typography_System with Fira Sans font
10. FOR ALL tree nodes in Sidebar, THE system SHALL display cursor-pointer on hover

### Requirement 3: Fix Navigation Routing Errors

**User Story:** As a user, I want all navigation links to work correctly, so that I can access posts and books without encountering errors.

#### Acceptance Criteria

1. WHEN a user clicks a post link, THE system SHALL navigate to the correct post detail page without errors
2. WHEN a user clicks a book link, THE system SHALL navigate to the correct book page without errors
3. WHEN a user clicks a category link, THE system SHALL navigate to the correct category page without errors
4. WHEN a user clicks a field link, THE system SHALL navigate to the first category within that field
5. THE system SHALL return HTTP 404 status for non-existent routes
6. THE system SHALL display a custom 404 page with navigation back to homepage
7. FOR ALL navigation transitions, THE system SHALL complete within 500 milliseconds

### Requirement 4: Landing Page Hero Section Redesign

**User Story:** As a visitor, I want an engaging hero section on the landing page, so that I understand the blog's value proposition immediately.

#### Acceptance Criteria

1. THE Hero_Section SHALL display a primary heading with the blog title using Typography_System heading level 1
2. THE Hero_Section SHALL display a tagline using Typography_System with font size 24px
3. THE Hero_Section SHALL display a description paragraph with maximum width 672px (max-w-2xl)
4. THE Hero_Section SHALL include a call-to-action button with Color_Palette CTA color #F97316
5. WHEN a user hovers over the CTA button, THE button SHALL transition background color over 200 milliseconds
6. THE Hero_Section SHALL use Grid_System with centered content alignment
7. THE Hero_Section SHALL include decorative background elements with primary color at 5% opacity
8. THE Hero_Section SHALL be responsive at all Responsive_Breakpoints
9. THE Hero_Section SHALL use Fira Sans font from Typography_System
10. FOR ALL interactive elements in Hero_Section, THE system SHALL display cursor-pointer

### Requirement 5: Recent Posts Section with Grid Layout

**User Story:** As a visitor, I want to see recent posts in a professional grid layout, so that I can discover new content easily.

#### Acceptance Criteria

1. THE system SHALL display 6 most recent posts in the Recent Posts Section
2. THE system SHALL arrange Post_Cards in a responsive grid using Grid_System
3. WHEN the viewport width is 1024px or greater, THE system SHALL display 3 Post_Cards per row
4. WHEN the viewport width is between 768px and 1023px, THE system SHALL display 2 Post_Cards per row
5. WHEN the viewport width is less than 768px, THE system SHALL display 1 Post_Card per row
6. WHEN a user hovers over a Post_Card, THE Post_Card SHALL apply box-shadow transition over 200 milliseconds
7. THE Post_Card SHALL use Typography_System with Fira Sans font
8. THE Post_Card SHALL display thumbnail image with aspect ratio 16:9
9. THE Post_Card SHALL truncate title to 2 lines maximum
10. THE Post_Card SHALL truncate excerpt to 200 characters maximum
11. FOR ALL Post_Cards, THE system SHALL display cursor-pointer

### Requirement 6: Featured Books Section

**User Story:** As a visitor, I want to see featured books on the homepage, so that I can discover recommended reading materials.

#### Acceptance Criteria

1. THE system SHALL display 3 featured books in the Featured Books Section
2. THE system SHALL arrange Book_Cards in a responsive grid using Grid_System
3. WHEN the viewport width is 1024px or greater, THE system SHALL display 3 Book_Cards per row
4. WHEN the viewport width is between 768px and 1023px, THE system SHALL display 2 Book_Cards per row
5. WHEN the viewport width is less than 768px, THE system SHALL display 1 Book_Card per row
6. THE Book_Card SHALL display cover image with aspect ratio 2:3
7. THE Book_Card SHALL use Typography_System with Fira Sans font
8. WHEN a user hovers over a Book_Card, THE Book_Card SHALL apply box-shadow transition over 200 milliseconds
9. THE Book_Card SHALL truncate description to 300 characters maximum
10. FOR ALL Book_Cards, THE system SHALL display cursor-pointer

### Requirement 7: Fields Overview Section

**User Story:** As a visitor, I want to see all content fields on the homepage, so that I can explore topics of interest.

#### Acceptance Criteria

1. THE system SHALL display all fields in the Fields Overview Section
2. THE system SHALL arrange Field_Cards in a responsive grid using Grid_System
3. WHEN the viewport width is 1024px or greater, THE system SHALL display 3 Field_Cards per row
4. WHEN the viewport width is between 768px and 1023px, THE system SHALL display 2 Field_Cards per row
5. WHEN the viewport width is less than 768px, THE system SHALL display 1 Field_Card per row
6. THE Field_Card SHALL display field name, description, and post count
7. THE Field_Card SHALL use Typography_System with Fira Sans font
8. WHEN a user hovers over a Field_Card, THE Field_Card SHALL apply box-shadow transition over 200 milliseconds
9. WHEN a user clicks a Field_Card, THE system SHALL navigate to the first category within that field
10. FOR ALL Field_Cards, THE system SHALL display cursor-pointer

### Requirement 8: Typography System Implementation

**User Story:** As a user, I want consistent, professional typography throughout the blog, so that content is readable and visually appealing.

#### Acceptance Criteria

1. THE Typography_System SHALL use Fira Sans font for all headings and body text
2. THE Typography_System SHALL use Fira Code font for all code blocks and technical content
3. THE Typography_System SHALL define heading level 1 with font size 48px and font weight 700
4. THE Typography_System SHALL define heading level 2 with font size 36px and font weight 600
5. THE Typography_System SHALL define heading level 3 with font size 24px and font weight 600
6. THE Typography_System SHALL define body text with font size 16px and line height 1.75
7. THE Typography_System SHALL define small text with font size 14px and line height 1.5
8. THE Typography_System SHALL use letter spacing -0.02em for headings
9. THE Typography_System SHALL use letter spacing 0 for body text
10. THE system SHALL load Fira Sans and Fira Code fonts from Google Fonts

### Requirement 9: Framer Motion Animation System

**User Story:** As a user, I want smooth, professional animations throughout the interface, so that interactions feel polished and responsive.

#### Acceptance Criteria

1. THE Animation_System SHALL use Framer Motion library for all animations
2. WHEN a page loads, THE system SHALL fade in content over 300 milliseconds
3. WHEN a user hovers over a card component, THE system SHALL apply scale transform of 1.02 over 200 milliseconds
4. WHEN the Sidebar expands or collapses, THE system SHALL animate width over 300 milliseconds with ease-in-out timing
5. WHEN a dropdown menu opens, THE system SHALL animate opacity and translateY over 200 milliseconds
6. WHEN a modal opens, THE system SHALL animate opacity and scale over 250 milliseconds
7. IF the user has prefers-reduced-motion enabled, THEN THE system SHALL disable all animations
8. THE Animation_System SHALL use spring physics for interactive elements with stiffness 300 and damping 30
9. THE Animation_System SHALL use ease-in-out timing for layout transitions
10. THE system SHALL limit animation duration to maximum 500 milliseconds

### Requirement 10: Color System Implementation

**User Story:** As a user, I want a cohesive color system with proper contrast, so that the interface is visually consistent and accessible.

#### Acceptance Criteria

1. THE Color_Palette SHALL define primary color as #64748B (industrial grey)
2. THE Color_Palette SHALL define secondary color as #94A3B8
3. THE Color_Palette SHALL define CTA color as #F97316 (safety orange)
4. THE Color_Palette SHALL define background color as #F8FAFC in light mode
5. THE Color_Palette SHALL define background color as #0F172A in dark mode
6. THE Color_Palette SHALL define text color as #334155 in light mode
7. THE Color_Palette SHALL define text color as #F1F5F9 in dark mode
8. THE system SHALL maintain contrast ratio of at least 4.5:1 for body text (WCAG AA)
9. THE system SHALL maintain contrast ratio of at least 3:1 for large text (WCAG AA)
10. THE system SHALL transition all color changes over 200 milliseconds when theme toggles
11. THE Color_Palette SHALL define muted text color as #64748B in light mode
12. THE Color_Palette SHALL define muted text color as #94A3B8 in dark mode

### Requirement 11: Grid System Implementation

**User Story:** As a developer, I want a consistent 12-column grid system, so that layouts are mathematically precise and maintainable.

#### Acceptance Criteria

1. THE Grid_System SHALL use 12 columns for all layout calculations
2. THE Grid_System SHALL use 8px as the base spacing unit
3. THE Grid_System SHALL define spacing scale as multiples of base unit (8px, 16px, 24px, 32px, 40px, 48px, 64px, 80px, 96px)
4. THE Grid_System SHALL define container max-width as 1280px (max-w-7xl)
5. THE Grid_System SHALL apply horizontal padding of 16px on mobile (below 768px)
6. THE Grid_System SHALL apply horizontal padding of 24px on tablet (768px to 1023px)
7. THE Grid_System SHALL apply horizontal padding of 32px on desktop (1024px and above)
8. THE Grid_System SHALL define gap between grid items as 24px on mobile
9. THE Grid_System SHALL define gap between grid items as 32px on desktop
10. THE Grid_System SHALL support asymmetric layouts where appropriate for visual interest

### Requirement 12: Component Redesign with Design System

**User Story:** As a user, I want all UI components to follow the new design system, so that the interface feels cohesive and professional.

#### Acceptance Criteria

1. THE Post_Card SHALL use Color_Palette for background, borders, and text colors
2. THE Post_Card SHALL use Typography_System for all text elements
3. THE Post_Card SHALL use Grid_System spacing for internal padding and margins
4. THE Book_Card SHALL use Color_Palette for background, borders, and text colors
5. THE Book_Card SHALL use Typography_System for all text elements
6. THE Book_Card SHALL use Grid_System spacing for internal padding and margins
7. THE Field_Card SHALL use Color_Palette for background, borders, and text colors
8. THE Field_Card SHALL use Typography_System for all text elements
9. THE Field_Card SHALL use Grid_System spacing for internal padding and margins
10. THE Navigation_Bar SHALL use Color_Palette for background and text colors
11. THE Sidebar SHALL use Color_Palette for background and text colors
12. THE Search_Bar SHALL use Color_Palette for background, border, and text colors

### Requirement 13: Search Interface Integration

**User Story:** As a user, I want an integrated search interface in the navigation bar, so that I can quickly find content without leaving the current page.

#### Acceptance Criteria

1. THE Search_Bar SHALL display in the Navigation_Bar on desktop viewports (768px and above)
2. WHEN the viewport width is less than 768px, THE system SHALL display a search icon button
3. WHEN a user clicks the search icon on mobile, THE system SHALL open a full-screen search overlay
4. THE Search_Bar SHALL use Typography_System with Fira Sans font
5. THE Search_Bar SHALL display a search icon on the left side
6. WHEN a user types in the Search_Bar, THE system SHALL debounce input by 300 milliseconds
7. WHEN search results are available, THE system SHALL display them in a dropdown below the Search_Bar
8. THE search dropdown SHALL display maximum 5 results with "View all results" link
9. THE Search_Bar SHALL use Color_Palette for background, border, and text colors
10. FOR ALL search result items, THE system SHALL display cursor-pointer

### Requirement 14: User Authentication UI

**User Story:** As a user, I want to see authentication controls in the navigation bar, so that I can sign in with Google and access personalized features.

#### Acceptance Criteria

1. THE User_Auth_UI SHALL display in the Navigation_Bar on all pages
2. WHEN a user is not authenticated, THE User_Auth_UI SHALL display "Sign in with Google" button
3. WHEN a user is authenticated, THE User_Auth_UI SHALL display user profile avatar
4. WHEN a user clicks the profile avatar, THE system SHALL display a dropdown menu with profile and sign out options
5. THE User_Auth_UI SHALL use Color_Palette for button and text colors
6. THE User_Auth_UI SHALL use Typography_System with Fira Sans font
7. THE "Sign in with Google" button SHALL display the Google logo SVG icon
8. THE User_Auth_UI SHALL use Framer Motion for dropdown animation
9. FOR ALL clickable elements in User_Auth_UI, THE system SHALL display cursor-pointer
10. THE User_Auth_UI SHALL transition colors over 200 milliseconds on hover

### Requirement 15: Mobile Navigation Menu

**User Story:** As a mobile user, I want a hamburger menu that opens a navigation drawer, so that I can access all navigation options on small screens.

#### Acceptance Criteria

1. WHEN the viewport width is less than 768px, THE Navigation_Bar SHALL display a Mobile_Menu button
2. THE Mobile_Menu button SHALL use a hamburger icon with three horizontal lines
3. WHEN a user clicks the Mobile_Menu button, THE system SHALL open a navigation drawer from the left side
4. THE navigation drawer SHALL animate slide-in over 300 milliseconds using Framer Motion
5. THE navigation drawer SHALL display all navigation links vertically
6. THE navigation drawer SHALL display the Sidebar content tree
7. THE navigation drawer SHALL include a close button at the top
8. WHEN a user clicks outside the drawer, THE system SHALL close the drawer
9. WHEN the drawer is open, THE system SHALL prevent body scroll
10. THE Mobile_Menu SHALL use Color_Palette for background and text colors
11. FOR ALL clickable elements in Mobile_Menu, THE system SHALL display cursor-pointer

### Requirement 16: Dark Mode Support

**User Story:** As a user, I want to toggle between light and dark modes, so that I can use the blog comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Theme_Toggle SHALL display in the Navigation_Bar on all pages
2. THE Theme_Toggle SHALL use a sun icon for light mode and moon icon for dark mode
3. WHEN a user clicks the Theme_Toggle, THE system SHALL switch between light and dark modes
4. THE system SHALL persist theme preference in browser localStorage
5. THE system SHALL apply theme preference on initial page load
6. THE system SHALL transition all colors over 200 milliseconds when theme changes
7. THE system SHALL use Color_Palette light mode colors when light theme is active
8. THE system SHALL use Color_Palette dark mode colors when dark theme is active
9. THE Theme_Toggle SHALL use Framer Motion for icon transition animation
10. FOR ALL components, THE system SHALL support both light and dark color schemes

### Requirement 17: Responsive Design at All Breakpoints

**User Story:** As a user on any device, I want the blog to display correctly at all screen sizes, so that I can access content comfortably on mobile, tablet, or desktop.

#### Acceptance Criteria

1. THE system SHALL define Responsive_Breakpoint at 375px for small mobile devices
2. THE system SHALL define Responsive_Breakpoint at 768px for tablets
3. THE system SHALL define Responsive_Breakpoint at 1024px for small desktops
4. THE system SHALL define Responsive_Breakpoint at 1440px for large desktops
5. WHEN the viewport width is 375px, THE system SHALL display all content without horizontal scroll
6. WHEN the viewport width is between 375px and 767px, THE system SHALL use single-column layouts
7. WHEN the viewport width is between 768px and 1023px, THE system SHALL use 2-column grid layouts
8. WHEN the viewport width is 1024px or greater, THE system SHALL use 3-column grid layouts
9. THE system SHALL use fluid typography that scales between breakpoints
10. THE system SHALL test responsive behavior at all defined Responsive_Breakpoints

### Requirement 18: Performance and Accessibility

**User Story:** As a user, I want the blog to load quickly and be accessible, so that I can access content efficiently regardless of my abilities or connection speed.

#### Acceptance Criteria

1. THE system SHALL use SVG icons from Heroicons or Lucide libraries exclusively
2. THE system SHALL NOT use emoji characters as UI icons
3. FOR ALL clickable elements, THE system SHALL display cursor-pointer on hover
4. FOR ALL interactive elements, THE system SHALL provide visible focus states for keyboard navigation
5. FOR ALL images, THE system SHALL provide descriptive alt text
6. FOR ALL form inputs, THE system SHALL provide associated label elements
7. THE system SHALL respect prefers-reduced-motion user preference
8. THE system SHALL maintain Lighthouse accessibility score of 90 or higher
9. THE system SHALL load initial page content within 2 seconds on 3G connection
10. THE system SHALL use Next.js Image component for all images with appropriate sizes attribute
11. FOR ALL animations, THE system SHALL limit duration to maximum 500 milliseconds
12. THE system SHALL provide ARIA labels for icon-only buttons

### Requirement 19: Dropdown Menu for Fields Navigation

**User Story:** As a user, I want a dropdown menu for the Lĩnh vực (Fields) navigation item, so that I can quickly access any field without multiple clicks.

#### Acceptance Criteria

1. WHEN a user hovers over the "Lĩnh vực" link in Navigation_Bar, THE system SHALL display a dropdown menu
2. THE dropdown menu SHALL list all available fields
3. THE dropdown menu SHALL animate opacity and translateY over 200 milliseconds using Framer Motion
4. WHEN a user clicks a field in the dropdown, THE system SHALL navigate to the first category within that field
5. THE dropdown menu SHALL use Color_Palette for background and text colors
6. THE dropdown menu SHALL use Typography_System with Fira Sans font
7. THE dropdown menu SHALL display field names with post counts
8. WHEN a user moves mouse away from dropdown, THE system SHALL close dropdown after 200 milliseconds delay
9. FOR ALL dropdown items, THE system SHALL display cursor-pointer
10. THE dropdown menu SHALL use Grid_System spacing for padding and margins

### Requirement 20: Smooth Page Transitions

**User Story:** As a user, I want smooth transitions between pages, so that navigation feels fluid and professional.

#### Acceptance Criteria

1. WHEN a user navigates to a new page, THE system SHALL fade out current content over 150 milliseconds
2. WHEN a new page loads, THE system SHALL fade in new content over 300 milliseconds
3. THE system SHALL display a loading progress bar at the top of the page during navigation
4. THE loading progress bar SHALL use Color_Palette CTA color #F97316
5. THE loading progress bar SHALL animate from 0% to 100% width
6. THE system SHALL use Framer Motion for page transition animations
7. IF the user has prefers-reduced-motion enabled, THEN THE system SHALL use instant transitions
8. THE system SHALL complete page transitions within 500 milliseconds
9. THE system SHALL maintain scroll position when navigating back
10. THE system SHALL scroll to top when navigating to new page

### Requirement 21: Comment Section Redesign

**User Story:** As a user, I want a professionally designed comment section, so that I can engage with content in a visually appealing interface.

#### Acceptance Criteria

1. THE comment section SHALL use Color_Palette for background, borders, and text colors
2. THE comment section SHALL use Typography_System with Fira Sans font
3. THE comment section SHALL use Grid_System spacing for padding and margins
4. THE comment form SHALL display user avatar from authentication
5. THE comment form SHALL use Color_Palette CTA color #F97316 for submit button
6. WHEN a user hovers over the submit button, THE button SHALL transition background color over 200 milliseconds
7. THE comment list SHALL display comments with user avatar, name, timestamp, and content
8. THE comment list SHALL use Typography_System for all text elements
9. FOR ALL clickable elements in comment section, THE system SHALL display cursor-pointer
10. THE comment section SHALL be responsive at all Responsive_Breakpoints

### Requirement 22: Newsletter Signup Form

**User Story:** As a visitor, I want to subscribe to the newsletter from the homepage, so that I can receive updates about new content.

#### Acceptance Criteria

1. THE system SHALL display a newsletter signup form in the Hero_Section
2. THE newsletter form SHALL include an email input field and submit button
3. THE newsletter form SHALL use Color_Palette for background, border, and text colors
4. THE newsletter form SHALL use Typography_System with Fira Sans font
5. THE submit button SHALL use Color_Palette CTA color #F97316
6. WHEN a user hovers over the submit button, THE button SHALL transition background color over 200 milliseconds
7. WHEN a user submits the form, THE system SHALL validate email format
8. IF the email is invalid, THEN THE system SHALL display an error message below the input
9. IF the email is valid, THEN THE system SHALL display a success message
10. THE newsletter form SHALL use Grid_System spacing for padding and margins
11. FOR ALL clickable elements in newsletter form, THE system SHALL display cursor-pointer

### Requirement 23: Social Share Buttons Redesign

**User Story:** As a user, I want to share posts on social media using professionally designed share buttons, so that I can easily promote content I enjoy.

#### Acceptance Criteria

1. THE social share buttons SHALL use SVG icons from Simple Icons library
2. THE social share buttons SHALL use Color_Palette for icon colors
3. WHEN a user hovers over a share button, THE button SHALL transition background color over 200 milliseconds
4. THE social share buttons SHALL display for Facebook, Twitter, LinkedIn, and copy link
5. WHEN a user clicks a share button, THE system SHALL open share dialog in new window
6. WHEN a user clicks copy link button, THE system SHALL copy URL to clipboard
7. WHEN URL is copied, THE system SHALL display a toast notification
8. THE social share buttons SHALL use Grid_System spacing for padding and margins
9. FOR ALL share buttons, THE system SHALL display cursor-pointer
10. THE social share buttons SHALL be responsive at all Responsive_Breakpoints

### Requirement 24: Table of Contents Redesign

**User Story:** As a reader, I want a professionally designed table of contents for long posts, so that I can navigate to specific sections easily.

#### Acceptance Criteria

1. THE table of contents SHALL use Color_Palette for background, borders, and text colors
2. THE table of contents SHALL use Typography_System with Fira Sans font
3. THE table of contents SHALL display on the right side on desktop viewports (1024px and above)
4. WHEN the viewport width is less than 1024px, THE table of contents SHALL display at the top of the post
5. THE table of contents SHALL use sticky positioning on desktop
6. WHEN a user clicks a heading link, THE system SHALL scroll to that section with smooth behavior
7. WHEN a section is in viewport, THE table of contents SHALL highlight the corresponding link
8. THE table of contents SHALL use Grid_System spacing for padding and margins
9. FOR ALL heading links, THE system SHALL display cursor-pointer
10. THE table of contents SHALL use Framer Motion for highlight transition animation

### Requirement 25: Loading States with Skeleton Screens

**User Story:** As a user, I want to see skeleton loading states while content loads, so that I understand the page is working and know what to expect.

#### Acceptance Criteria

1. WHEN content is loading, THE system SHALL display skeleton screens matching the final layout
2. THE skeleton screens SHALL use Color_Palette muted colors with pulse animation
3. THE skeleton Post_Card SHALL match the dimensions and layout of actual Post_Card
4. THE skeleton Book_Card SHALL match the dimensions and layout of actual Book_Card
5. THE skeleton Sidebar SHALL match the dimensions and layout of actual Sidebar
6. THE skeleton animation SHALL pulse opacity between 0.5 and 1.0 over 1500 milliseconds
7. WHEN content loads, THE system SHALL fade out skeleton and fade in content over 300 milliseconds
8. THE system SHALL use Framer Motion for skeleton to content transition
9. THE skeleton screens SHALL be responsive at all Responsive_Breakpoints
10. THE skeleton screens SHALL use Grid_System for layout and spacing

### Requirement 26: Error State Design

**User Story:** As a user, I want clear, professionally designed error messages, so that I understand what went wrong and how to proceed.

#### Acceptance Criteria

1. WHEN an error occurs, THE system SHALL display an error message using Color_Palette destructive color
2. THE error message SHALL use Typography_System with Fira Sans font
3. THE error message SHALL include an icon, heading, description, and action button
4. THE error icon SHALL use SVG from Heroicons library
5. THE action button SHALL use Color_Palette primary color
6. WHEN a user hovers over the action button, THE button SHALL transition background color over 200 milliseconds
7. THE error message SHALL use Grid_System spacing for padding and margins
8. THE error message SHALL be responsive at all Responsive_Breakpoints
9. FOR ALL clickable elements in error message, THE system SHALL display cursor-pointer
10. THE system SHALL use Framer Motion to animate error message appearance

### Requirement 27: Focus States for Keyboard Navigation

**User Story:** As a keyboard user, I want visible focus states on all interactive elements, so that I can navigate the blog efficiently without a mouse.

#### Acceptance Criteria

1. FOR ALL interactive elements, THE system SHALL display a visible focus ring when focused
2. THE focus ring SHALL use Color_Palette primary color #64748B
3. THE focus ring SHALL have 2px width and 2px offset
4. THE focus ring SHALL use border-radius matching the element shape
5. WHEN an element receives focus, THE focus ring SHALL appear instantly
6. WHEN an element loses focus, THE focus ring SHALL disappear instantly
7. THE system SHALL support Tab key navigation through all interactive elements in logical order
8. THE system SHALL support Shift+Tab for reverse navigation
9. WHEN a dropdown is open, THE system SHALL trap focus within the dropdown
10. WHEN a modal is open, THE system SHALL trap focus within the modal
11. THE system SHALL support Escape key to close dropdowns and modals
12. THE focus ring SHALL maintain contrast ratio of at least 3:1 against background (WCAG AA)
