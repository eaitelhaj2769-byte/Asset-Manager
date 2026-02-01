# FSJES UCA Results+ Design Guidelines

## 1. Brand Identity

**Purpose**: Transform dense academic data into an accessible, visually intuitive experience for university students checking their grades.

**Aesthetic Direction**: **Editorial/Academic Confidence** - Clean typographic hierarchy with purposeful color coding that respects the seriousness of academic results while maintaining modern approachability. Think: official university transcript meets contemporary mobile app.

**Memorable Element**: Intelligent color-coded grade system that communicates status at a glance, with generous whitespace that lets results breathe rather than overwhelming students with data.

---

## 2. Navigation Architecture

**Root Navigation**: Tab Bar (4 tabs)
- Home (house icon) - Student ID input & welcome
- Results (file-text icon) - Current semester grades
- History (bar-chart-2 icon) - Past semesters & trends
- Settings (settings icon) - Language, theme, preferences

**No Authentication Required**: App fetches public data via student ID input. Include Settings screen with:
- Language selector (Arabic/French/English)
- Theme toggle (Light/Dark)
- Clear cache option
- About section with developer credit

---

## 3. Screen-by-Screen Specifications

### 3.1 Home Screen (Tab 1)
**Purpose**: Student ID entry point with clear disclaimer

**Layout**:
- Header: Transparent, no title, settings icon (top right)
- Main: Scrollable content
- Safe Area: top = headerHeight + Spacing.xl, bottom = tabBarHeight + Spacing.xl

**Components**:
1. University logo (centered, 80x80pt)
2. App title "FSJES UCA Results+" (Typography.title1)
3. Disclaimer card with all three language versions (Surface color, Typography.body, 16pt padding)
4. Student ID input field with validation (10-digit code format)
5. Primary CTA button "View Results" / "Voir les résultats" / "عرض النتائج"
6. Recent searches list (if previously viewed IDs exist)

**Empty State**: Welcome illustration with ID input prompt

### 3.2 Results Screen (Tab 2)
**Purpose**: Display current semester grades with visual status indicators

**Layout**:
- Header: Default navigation, title = "Results / Résultats / النتائج", refresh icon (top right)
- Main: Scrollable list
- Safe Area: top = Spacing.xl, bottom = tabBarHeight + Spacing.xl

**Components**:
1. Student info card (name, semester, academic year) - Surface color
2. Summary card showing:
   - Semester GPA (large, bold)
   - Credits earned/total
   - Pass/fail count (color-coded chips)
3. Results list (grouped by subject):
   - Each item: Subject name (left), Grade (center, color-coded), Status icon (right)
   - Use semantic colors: Colors.success for V/AC, Colors.error for NV, Colors.warning for ABJ, Colors.disabled for ABI
4. Floating action button (bottom right) for export/share

**Empty State**: "Enter student ID on Home" illustration

### 3.3 History Screen (Tab 3)
**Purpose**: Show GPA trends and past semester results

**Layout**:
- Header: Default navigation, title = "History / Historique / السجل"
- Main: Scrollable content
- Safe Area: top = Spacing.xl, bottom = tabBarHeight + Spacing.xl

**Components**:
1. GPA trend chart (line graph, 200pt height)
2. Semester cards (expandable):
   - Semester name + year
   - GPA badge (color-coded)
   - Tap to expand full results
3. Comparative stats card (total credits, overall GPA)

**Empty State**: "No history yet" illustration

### 3.4 Settings Screen (Tab 4)
**Purpose**: Language, theme, and data management

**Layout**:
- Header: Default navigation, title = "Settings / Paramètres / الإعدادات"
- Main: Scrollable form
- Safe Area: top = Spacing.xl, bottom = tabBarHeight + Spacing.xl

**Components**:
1. Language section with radio buttons (Arabic/French/English)
2. Appearance section:
   - Light/Dark mode switch with preview
   - Font size slider
3. Data management:
   - Clear cache button (destructive color)
   - Export all data button
4. Footer: "Designed by El Mahdi" (Typography.caption, center aligned)

---

## 4. Color Palette

**Primary**: #1E3A8A (Deep academic blue - conveys trust and authority)  
**Secondary**: #0EA5E9 (Bright sky blue - modern accent)

**Backgrounds**:
- Light: #FFFFFF
- Dark: #0F172A
- Surface Light: #F8FAFC
- Surface Dark: #1E293B

**Semantic Colors** (critical for grade display):
- Success: #10B981 (Green - passed subjects V, AC)
- Error: #EF4444 (Red - failed subjects NV)
- Warning: #F59E0B (Orange - ABJ justified absence)
- Disabled: #9CA3AF (Gray - ABI unjustified absence)

**Text**:
- Primary Light: #0F172A
- Primary Dark: #F1F5F9
- Secondary: #64748B

---

## 5. Typography

**Font Family**: **IBM Plex Sans** (Google Font - excellent multilingual support for Arabic, French, English)

**Type Scale**:
- title1: 28pt, Bold (screen headers, GPA display)
- title2: 22pt, SemiBold (section headers)
- title3: 18pt, SemiBold (card titles)
- body: 16pt, Regular (main content, subject names)
- caption: 14pt, Regular (metadata, helper text)
- small: 12pt, Regular (footnotes)

**Arabic Text**: Use IBM Plex Sans Arabic variant for proper RTL support

---

## 6. Visual Design

- Icons: Feather icon set from @expo/vector-icons (consistent, minimal)
- Floating Action Button (export/share): Use drop shadow with shadowOffset {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2
- Grade cards: NO drop shadow, use subtle border (1px, Surface color)
- Status indicators: Use filled circles (8pt diameter) next to grade values
- Touchable feedback: Reduce opacity to 0.7 on press for all buttons
- Card radius: 12pt for all surface elements

---

## 7. Assets to Generate

**Required**:
1. **icon.png** - App icon featuring stylized academic cap or university pillars in Primary blue - WHERE USED: Device home screen
2. **splash-icon.png** - Same as icon.png but simplified for splash - WHERE USED: App launch screen
3. **empty-home.png** - Illustration of student with ID card/document - WHERE USED: Home screen when no ID entered
4. **empty-results.png** - Illustration of empty gradebook or checklist - WHERE USED: Results screen before data loaded
5. **empty-history.png** - Illustration of calendar/timeline with question marks - WHERE USED: History screen when no past data
6. **fsjes-logo.png** - FSJES UCA official logo (if permitted) or generic university icon - WHERE USED: Home screen header (80x80pt)

**Recommended**:
7. **grade-success.png** - Subtle celebration confetti/checkmark - WHERE USED: Results screen when all subjects passed
8. **grade-warning.png** - Gentle alert icon for mixed results - WHERE USED: Results summary card

**Asset Style**: Flat illustration style with Primary and Secondary color palette, minimal detail, friendly but professional tone matching academic context.