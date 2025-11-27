## Mentor Feature Progress

### Dashboard
- **Status:** Connected to live data.
- **Endpoints:** `/assessments/mentor/me`, `/mentor-feedback/mentor/me`, `/mentor-resources/mentor/me`.
- **Details:** Tiles display counts from API responses with error/fallback messaging.

### My Learners
- **Status:** Uses backend data.
- **Endpoint:** `/mentors/me/learners`.
- **Details:** Search/filter works on actual learner assignments (package, dates, payment status).

### Assessments
- **Status:** Listing + creation wired.
- **Endpoints:** `/assessments/mentor/me`, `/assessments`.
- **Details:** Displays real assessments; submit form posts payload to backend with validation and toasts.

### Resources
- **Status:** Fully connected.
- **Endpoints:** `/mentor-resources/mentor/me`, `/mentor-resources`.
- **Details:** List shows actual resources; creation dialog submits to backend and refreshes list.

### Feedback
- **Status:** Fully connected.
- **Endpoints:** `/mentor-feedback/mentor/me`, `/mentor-feedback`.
- **Details:** Table shows API results; dialog posts new feedback and refreshes list.

### My Profile
- **Status:** Fetch/edit uses backend.
- **Endpoints:** `/mentors/me` (GET/PUT).
- **Details:** Loads mentor profile fields and allows updating bio, skills, experience, availability.

### Additional Fixes
- Removed automatic token clearing on 401 to keep mentor sessions alive while hitting restricted APIs.
- Added package ↔ mentor mapping so learner views show assigned mentors.

