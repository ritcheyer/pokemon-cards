# Testing Checklist - Post-Refactoring

## 🎯 Critical Path Tests

### User Management
- [ ] Create new user
- [ ] Select existing user
- [ ] Switch between users
- [ ] User avatar displays correctly

### Card Search & Add
- [ ] Search single-word Pokemon (e.g., "pikachu")
- [ ] Search multi-word Pokemon (e.g., "emolga ex")
- [ ] Search with special characters
- [ ] Search results display correctly
- [ ] Click on search result to select card
- [ ] Add card with default values (quantity: 1, condition: near-mint)
- [ ] Add card with custom quantity
- [ ] Add card with different condition
- [ ] Add card with notes
- [ ] Cancel adding card (back button)
- [ ] Close modal with X button
- [ ] Close modal with Escape key

### Card Collection View
- [ ] Cards display in grid
- [ ] Card images load correctly
- [ ] Card details show (name, set, rarity, condition, quantity)
- [ ] Click card to open detail modal

### Card Detail & Edit
- [ ] View mode displays all card info correctly
- [ ] Click "Edit" button to enter edit mode
- [ ] Edit quantity (increase/decrease)
- [ ] Edit condition (change dropdown)
- [ ] Edit notes (add/modify/clear)
- [ ] Save changes
- [ ] Cancel editing (reverts changes)
- [ ] Delete card
- [ ] Close modal with X button
- [ ] Close modal with Escape key

## 🎨 UI Component Tests

### Button Component
- [ ] Primary button styling correct
- [ ] Secondary button styling correct (white background)
- [ ] Danger button styling correct
- [ ] Disabled state works
- [ ] Hover states work
- [ ] Button width in modals (flex-1)
- [ ] Button width standalone (auto)
- [ ] Dark mode styling

### Input Component
- [ ] Label displays
- [ ] Input accepts text
- [ ] Number input works (quantity)
- [ ] Placeholder text shows
- [ ] Disabled state works
- [ ] Focus ring appears
- [ ] Dark mode styling

### Select Component
- [ ] Label displays
- [ ] Dropdown opens
- [ ] Options selectable
- [ ] Custom arrow displays
- [ ] Disabled state works
- [ ] Dark mode styling
- [ ] Dark mode arrow color

### Textarea Component
- [ ] Label displays
- [ ] Multi-line text works
- [ ] Placeholder shows
- [ ] Disabled state works
- [ ] No resize handle (disabled)
- [ ] Dark mode styling

### Link (Switch User)
- [ ] Styled like secondary button
- [ ] Navigates to home page
- [ ] Hover state works
- [ ] Proper width (not full width)

## ⚡ Performance Tests

### Search Performance
- [ ] Debounce works (300ms delay)
- [ ] No duplicate searches
- [ ] Cached results load instantly
- [ ] Form submit searches immediately (no debounce)

### Data Persistence
- [ ] Added cards persist after refresh
- [ ] Edited cards persist after refresh
- [ ] Deleted cards removed after refresh
- [ ] User selection persists

## 🌓 Dark Mode Tests
- [ ] Toggle dark mode works
- [ ] All buttons readable in dark mode
- [ ] All inputs readable in dark mode
- [ ] Modal backgrounds correct
- [ ] Text contrast sufficient
- [ ] Card grid readable

## 📱 Responsive Tests (if applicable)
- [ ] Mobile view works
- [ ] Tablet view works
- [ ] Modal fits on small screens
- [ ] Buttons stack properly
- [ ] Grid adjusts to screen size

## 🐛 Edge Cases

### Search
- [ ] Empty search (no results)
- [ ] Very long Pokemon name
- [ ] Special characters in search
- [ ] Search while previous search loading

### Forms
- [ ] Submit with invalid data
- [ ] Quantity = 0 or negative
- [ ] Very long notes text
- [ ] Rapid clicking buttons

### Network
- [ ] Offline mode (if implemented)
- [ ] Slow network simulation
- [ ] API error handling

## ✅ Test Results

**Date:** [Fill in]
**Tester:** [Fill in]
**Browser:** [Fill in]
**OS:** [Fill in]

### Critical Issues Found:
- [ ] None

### Minor Issues Found:
- [ ] None

### Notes:
