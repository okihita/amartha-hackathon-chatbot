# Design Document

## Overview

This design document outlines the technical approach for implementing UI/UX improvements to the Amartha Dashboard. The improvements focus on information density, layout stability, consistent visual hierarchy, and mobile responsiveness. The changes will be implemented primarily through CSS modifications and minimal HTML restructuring to maintain existing functionality while enhancing the user experience.

## Architecture

The UI/UX improvements follow a layered approach:

1. **CSS Layer**: Core styling improvements in `public/styles.css` for global consistency
2. **HTML Structure Layer**: Minimal modifications to HTML files to support layout stability
3. **JavaScript Interaction Layer**: Updates to maintain consistent behavior with new layouts

### Design Principles

- **Progressive Enhancement**: Improvements work on all browsers with graceful degradation
- **Mobile-First**: Responsive design starts with mobile constraints
- **Performance**: CSS-only solutions preferred over JavaScript where possible
- **Accessibility**: WCAG AA compliance maintained throughout

## Components and Interfaces

### 1. User Table Component

**Location**: `public/index.html`

**Current Issues**:
- Conditional button rendering causes layout shifts
- Action buttons disappear when user is verified

**Improvements**:
- Keep all action buttons visible at all times
- Use `disabled` attribute and `opacity: 0.3` for disabled state
- Maintain consistent button spacing using flexbox

**Interface**:
```html
<div class="actions">
  <button class="btn-view">👁️ View</button>
  <button class="btn-approve" disabled style="opacity: 0.3">✓ Approve</button>
  <button class="btn-reject" disabled style="opacity: 0.3">✗ Reject</button>
  <button class="btn-delete">🗑️ Delete</button>
</div>
```

### 2. Majelis Card Component

**Location**: `public/majelis.html`

**Current State**: Already displays members inline (good!)

**Improvements**:
- Enhanced visual hierarchy for member list
- Better spacing and typography
- Improved empty state messaging
- Consistent card heights

**Interface**:
```html
<div class="majelis-card">
  <h3 class="majelis-title">Majelis Name</h3>
  <div class="majelis-info">
    <span class="info-item">📅 Schedule</span>
    <span class="info-item">📍 Location</span>
  </div>
  <div class="member-section">
    <div class="member-count">👥 5 members</div>
    <div class="member-list-inline">
      <!-- Members displayed directly -->
    </div>
  </div>
  <div class="card-actions">
    <!-- Action buttons -->
  </div>
</div>
```

### 3. Status Badge Component

**Locations**: All pages

**Improvements**:
- Consistent color scheme across all pages
- Icon support for quick scanning
- Proper contrast ratios

**Color Mapping**:
- Verified/Active/Assigned: `#28a745` (green)
- Pending/Warning: `#ffc107` (yellow)
- Rejected/Error/Unassigned: `#dc3545` (red)
- Neutral/Inactive: `#6c757d` (gray)

### 4. Responsive Navigation

**Location**: Header component in all pages

**Improvements**:
- Better mobile navigation
- Touch-friendly targets (44x44px minimum)
- Collapsible menu for small screens

### 5. Table Enhancements

**Improvements**:
- Zebra striping for readability
- Fixed headers on scroll
- Row hover states
- Responsive column hiding on mobile

## Data Models

No data model changes required. All improvements are presentational.


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Disabled buttons remain visible

*For any* verified user in the users table, the approve and reject buttons should exist in the DOM with the disabled attribute set to true
**Validates: Requirements 2.1**

### Property 2: Disabled buttons have reduced opacity

*For any* disabled button in the dashboard, the button should have an opacity style value of 0.3 or less
**Validates: Requirements 2.2**

### Property 3: Verification status color mapping

*For any* user status display, verified users should have green color (#28a745) and pending users should have yellow color (#ffc107)
**Validates: Requirements 3.1**

### Property 4: Majelis assignment color mapping

*For any* majelis assignment status display, assigned users should have green color and unassigned users should have gray color (#6c757d)
**Validates: Requirements 3.2**

### Property 5: Credit risk level color mapping

*For any* credit risk level display, low risk should be green (#28a745), medium risk should be yellow (#ffc107), and high risk should be red (#dc3545)
**Validates: Requirements 3.3**

### Property 6: Transaction amount color mapping

*For any* transaction amount display, positive amounts (disbursements) should have green color and negative amounts (payments) should have red color
**Validates: Requirements 3.4**

### Property 7: WCAG AA contrast compliance

*For any* interactive element with color coding, the contrast ratio between foreground and background should be at least 4.5:1 for normal text and 3:1 for large text
**Validates: Requirements 3.5**

### Property 8: Touch target minimum size

*For any* button or interactive element on mobile viewports, the element should have minimum dimensions of 44x44 pixels
**Validates: Requirements 4.3**

### Property 9: Action buttons always present

*For any* table row with actions, all action buttons should be present in the DOM regardless of the row's state
**Validates: Requirements 7.4**

### Property 10: Pagination threshold

*For any* list of items, pagination should only be applied when the list contains more than 100 items
**Validates: Requirements 8.4**

## Error Handling

### CSS Fallbacks

- Use CSS custom properties with fallback values
- Provide fallback colors for older browsers
- Ensure graceful degradation for unsupported features

```css
.status-verified {
  background: var(--color-success, #28a745);
  color: var(--color-success-text, #155724);
}
```

### JavaScript Error Handling

- Wrap DOM manipulations in try-catch blocks
- Provide fallback behavior if elements are not found
- Log errors to console for debugging

### Responsive Breakpoint Handling

- Use mobile-first approach with min-width media queries
- Provide sensible defaults for all screen sizes
- Test at common breakpoints: 320px, 768px, 1024px, 1440px

## Testing Strategy

### Unit Testing

Unit tests will focus on:
- CSS class application logic
- Color mapping functions
- Responsive breakpoint calculations
- Contrast ratio calculations

### Visual Regression Testing

- Capture screenshots at key breakpoints
- Compare before/after states
- Test on multiple browsers (Chrome, Firefox, Safari)

### Accessibility Testing

- Automated contrast ratio checking using tools like axe-core
- Keyboard navigation testing
- Screen reader compatibility testing

### Manual Testing Checklist

1. **Layout Stability**
   - Verify buttons don't disappear on state changes
   - Check that row heights remain consistent
   - Confirm no layout shifts during loading

2. **Color Consistency**
   - Verify status colors across all pages
   - Check contrast ratios meet WCAG AA
   - Test color-blind friendly alternatives

3. **Mobile Responsiveness**
   - Test on actual mobile devices
   - Verify touch targets are adequate
   - Check navigation usability

4. **Information Density**
   - Confirm all critical info is visible
   - Verify no unnecessary clicks required
   - Check scanability of layouts

### Property-Based Testing

Property-based tests will be implemented using a JavaScript testing framework (Jest with fast-check). Each correctness property will be tested with generated inputs to ensure the rules hold across all cases.

**Testing Framework**: Jest with fast-check for property-based testing

**Test Configuration**: Each property test should run a minimum of 100 iterations to ensure coverage across random inputs.

**Test Organization**: Property tests will be co-located with the components they test, using the naming convention `*.property.test.js`.

## Implementation Notes

### CSS Architecture

- Use CSS custom properties for theming
- Organize styles by component
- Use BEM naming convention for clarity
- Minimize specificity conflicts

### Performance Considerations

- Minimize repaints and reflows
- Use CSS transforms for animations
- Avoid expensive CSS selectors
- Lazy load images only, not text

### Browser Compatibility

Target browsers:
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile Safari (iOS 13+)
- Chrome Mobile (Android 8+)

### Accessibility Standards

- WCAG 2.1 Level AA compliance
- Semantic HTML structure
- ARIA labels where appropriate
- Keyboard navigation support
- Focus indicators visible

## Migration Strategy

1. **Phase 1**: Update CSS in `styles.css` for global improvements
2. **Phase 2**: Update HTML structure in `index.html` for layout stability
3. **Phase 3**: Update `majelis.html` for improved card design
4. **Phase 4**: Update `user-profile.html` for better information hierarchy
5. **Phase 5**: Test across all browsers and devices
6. **Phase 6**: Deploy and monitor for issues

Each phase can be deployed independently to minimize risk.
