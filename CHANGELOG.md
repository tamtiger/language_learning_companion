# Changelog

All notable changes to the Language Learning Companion project will be documented in this file.

## [Unreleased] - 2026-07-04

### Added
- **Modern UI Styling**: Integrated Google Fonts (`Nunito`) to improve overall typography and app readability.
- **Tailwind-inspired Brand Colors**: Overhauled the application themes (Light & Dark) with modern Indigo as the primary color, accompanied by Teal and Amber accents.
- **Glassmorphism & Bo-corners**: Upgraded all card components to use 24px/28px border-radius, soft diffused shadows, and subtle outlines.
- **Gradient Streak Banner**: Redesigned the daily streak tracker to use a vibrant Orange-to-Rose gradient banner with a glowing icon design.
- **Dashboard Layout**: Reorganized stats (Review queue & Progress tracker) on the `Today` screen into an appealing grid card format using light, color-matching pastel backgrounds for icons.
- **Milestone Timeline**: Modernized the `RoadmapScreen` into a clear milestone map with circular progress step numbers, linking lines, and clean outline-to-filled checkmarks.
- **Curriculum split JSON dataset**: Exported curriculum data to individual `{lesson_id}.json` files under `assets/lessons/` and generated a `curriculum_manifest.json` metadata index.

### Changed
- **Curriculum Load Strategy**: Swapped SQL-based curriculum loader in `CurriculumDataSource` with a Split JSON parser. The app now loads the lightweight manifest first, and fetches full lesson contents asynchronously when selected, solving Web/Chrome initialization errors.
- **App Shell Navigation**: Modified the bottom `NavigationBar` with subtle top shadows, filled/outlined icon states, and updated item labeling.
- **Cleaned DatabaseHelper**: Reverted `DatabaseHelper` to Version 1 to handle only user states (`lesson_progress`, `streak`, `review_queue`) and removed unused SQL schemas.

### Removed
- Unused markdown lesson and module assets in the `app/assets` directory.
- Unused `intl` package dependency from `pubspec.yaml` to reduce package size.
- Redundant `.db` files from compilation attempts.
- Redundant `toMap()` parser inside `LessonModel`.
