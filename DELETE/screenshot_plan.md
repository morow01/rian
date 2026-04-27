# Rian Application: Comprehensive Screenshot Sweep

The goal is to capture high-quality screenshots of every possible state and screen in the Rian application. These images will be used for a deep UI/UX audit, printing, and high-fidelity redesigns.

## User Review Required

> [!IMPORTANT]
> **Data Privacy**: The screenshots will contain your project's data (tasks, notes, etc.). Please ensure that any sensitive information you don't want in the screenshots is temporarily removed or changed before I start the sweep.
>
> **Scope**: I have identified **19 unique views**. For each view, I will capture:
> 1. **Desktop View** (1440x900)
> 2. **Mobile View** (375x812)
> 
> This will result in approximately **40 image files**.

## Proposed Strategy

### 1. Environment Setup
*   Ensure the local server at `http://localhost:3000/app` is stable.
*   Clear any temporary notification overlays that might block the UI.

### 2. The Sweep Checklist
I will use the browser subagent to visit each of the following in sequence:
*   **Main Navigation**: Timesheet, Notes, Journal, Finder (Exchanges/Cabinets).
*   **Global Overlays**: Main Menu, AI Assistant (Chat & Results), Voice Input state.
*   **Deep Links/Drill-downs**: Expanded Day, Expanded Task, Edit Note form.
*   **Modals**: Jump to Week, Tag Manager, Snapshots/Recover, Weekly Summary Preview.

### 3. File Organization
Screenshots will be saved to: `C:\Users\morow\OneDrive\Vibe Code\TimeSheet\Screenshots`
Naming Convention: `[ViewName]_[Device]_[State].png`
*Example: `Timesheet_Mobile_DayExpanded.png`*

## Proposed Components

### [NEW] `screenshot_sweep.py` (Drafting)
I may write a one-off Playwright script to automate this if the subagent becomes too slow for 40 captures, but I will start with orchestrated subagent tasks for maximum reliability in the current environment.

### [NEW] `Screenshots/README.md`
A catalog file that lists each screenshot and what UI elements it demonstrates.

## Open Questions

1.  **Do you want specific data showing?** (e.g., "Make sure Friday has 3 tasks" or "Ensure the AI Assistant has a long response visible").
2.  **Naming Preferences**: Is the proposed `View_Device_State.png` format acceptable for your printing/sorting process?
3.  **Mockups**: Would you also like me to capture screenshots of the files in the `_mockups` folder for comparison?

## Verification Plan

### Manual Verification
*   I will verify each screenshot path exists and the content is correct before finishing.
*   I will provide you with a gallery/list of the captured files.
