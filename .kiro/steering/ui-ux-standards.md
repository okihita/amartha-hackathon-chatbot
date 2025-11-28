# UI/UX Standards

## Information Density Principles

### 1. Optimize for Scanning
- **Show, don't hide** - Display critical information directly, not behind clicks
- **Reduce cognitive load** - Users should understand data at a glance
- **Minimize interactions** - Fewer clicks = faster workflow

### 2. Dashboard Design Rules

#### Majelis Cards
- ✅ **DO**: Show member list directly on card
- ✅ **DO**: Display member count prominently
- ✅ **DO**: Show key info (name, schedule, location) upfront
- ❌ **DON'T**: Hide members behind modal/button
- ❌ **DON'T**: Require clicks to see basic info

#### User Tables
- ✅ **DO**: Show all relevant columns (name, phone, business, location, majelis, status)
- ✅ **DO**: Use color coding for quick status identification
- ✅ **DO**: Keep actions visible and accessible
- ❌ **DON'T**: Paginate unless absolutely necessary
- ❌ **DON'T**: Hide important data in tooltips

### 3. Visual Hierarchy

**Priority Levels:**
1. **Critical** - Always visible, prominent (names, status, membership)
2. **Important** - Visible but secondary (phone, location, schedule)
3. **Contextual** - Show on hover or expand (descriptions, notes)
4. **Actions** - Clearly marked buttons (edit, delete, add)

### 4. Layout Guidelines

#### Cards
```
┌─────────────────────────────┐
│ Title (Bold, Large)         │
│ Key Info (Icons + Text)     │
│ ├─ Schedule                 │
│ ├─ Location                 │
│ └─ Member Count             │
│                             │
│ Members List (Visible)      │
│ • Member 1                  │
│ • Member 2                  │
│ • Member 3                  │
│                             │
│ [Actions]                   │
└─────────────────────────────┘
```

#### Tables
- Fixed header for scrolling
- Zebra striping for readability
- Inline actions per row
- Responsive column widths

### 5. Color Coding

**Status Colors:**
- 🟢 Green (#28a745) - Verified, Active, Assigned
- 🟡 Yellow (#ffc107) - Pending, Warning
- 🔴 Red (#dc3545) - Rejected, Error, Unassigned
- ⚪ Gray (#6c757d) - Neutral, Inactive

**Usage:**
- Use sparingly for emphasis
- Maintain contrast for accessibility
- Consistent across all pages

### 6. Interaction Patterns

**Modals:**
- Use ONLY for:
  - Forms (create/edit)
  - Confirmations (delete)
  - Complex multi-step actions
- NOT for viewing data

**Buttons:**
- Primary action: Blue (#007bff)
- Success: Green (#28a745)
- Danger: Red (#dc3545)
- Secondary: Gray (#6c757d)

### 7. Mobile Considerations

- Stack cards vertically on small screens
- Collapse less important columns in tables
- Ensure touch targets are 44x44px minimum
- Test on mobile devices regularly

### 8. Performance

- Lazy load images only
- Show all text data immediately
- Use pagination only for 100+ items
- Optimize for fast initial render

### 9. Accessibility

- Proper color contrast (WCAG AA minimum)
- Keyboard navigation support
- Screen reader friendly labels
- Focus indicators visible

### 10. Testing Checklist

Before deploying UI changes:
- [ ] Can I understand the data in 3 seconds?
- [ ] Do I need to click to see critical info?
- [ ] Is the most important info visible first?
- [ ] Are actions clearly labeled?
- [ ] Does it work on mobile?
- [ ] Is the color contrast sufficient?

## Examples

### ✅ Good: Information Dense
```
Majelis Sragen A
📅 Selasa 10:00 | 📍 Balai Desa | 👥 5 members

Members:
• Ibu Siti (628xxx) - Warung Sembako
• Ibu Ani (628xxx) - Jual Gorengan
• Ibu Dewi (628xxx) - Warung Kopi

[Edit] [Delete] [Add Member]
```

### ❌ Bad: Information Sparse
```
Majelis Sragen A
👥 5 members

[View Details] [Members] [Edit]
```

## Implementation Priority

1. **High** - Show members on Majelis cards
2. **High** - Display all user columns in table
3. **Medium** - Add color coding for status
4. **Medium** - Optimize mobile layout
5. **Low** - Add hover states and animations
