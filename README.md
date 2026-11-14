# SmartAcademic — Frontend

## Project Brief
SmartAcademic Frontend project is a modern, responsive React web application built to streamline institutional operations, attendance tracking, live exams, and AI-guided student revision. It provides a unified, high-contrast interface tailored for administrators, teachers, and students.

## Business Rationale
Educational institutions require reliable, accessible, and distraction-free software to manage daily operations. This client application addresses two primary business needs:
* **Brand Authority & Clarity:** A strict, high-contrast visual hierarchy (`#10002b`, `#c77dff`, and white) eliminates visual clutter and builds institutional trust.
* **Operational Efficiency:** Role-based dashboards give administrators, teachers, and students direct access to localized tools—reducing administrative bottlenecks and manual registers.

## Technologies Used
* **React & Vite:** Fast, component-based UI architecture and optimized development build tooling.
* **Tailwind CSS:** Utility-first styling enforcing a strict brand palette and responsive grid layouts.
* **React Router:** Client-side routing with role-protected dashboard views (`/dashboard/admin`, `/dashboard/teacher`, `/dashboard/student`).
* **Google OAuth (`@react-oauth/google`) & JWT (`jwt-decode`):** Secure token-based authentication and automatic role routing.
* **Lucide React:** Clean, consistent iconography across navigation and dashboard modules.
* **Git/GitHub:** Version control and feature-based branching.

## Accessibility Features
* **High-Contrast Typography:** Deep purple (`#10002b`) typography on crisp white surfaces ensures maximum readability across all devices.
* **Semantic Structure:** Proper use of `<header>`, `<nav>`, `<main>`, `<section>`, and `<table>` elements for screen readers.
* **Interactive Feedback:** Clear focus rings, hover states, and descriptive button labels across all forms, modals, and navigation menus.

## Product Features
* **Role-Based Portals:** Dedicated dashboards for Admins (user invites, classroom management, teacher attendance logs), Teachers (assignments, exams, grading, analysis geo-attendance), and Students (live exams, materials, grades).
* **Single-Page Landing Experience:** Smooth-scrolling overview featuring Hero, Core System Modules, About FAQ, and Contact sections, plus dedicated Legal pages.
* **Mwalimu AI Interface:** Interactive Socratic study assistant designed to guide students through revision materials without giving away direct answers.
* **Tokenized Onboarding:** Seamless registration flow connected to admin email invitation links.

## Git Workflow
* **Fork the Repository:** Create your own copy of the project to work on.
* **Create a Feature Branch:**
  ```bash
  git checkout -b feature/YourFeatureName

* **Commit Changes:**
* **Push to Branch**
    ```bash
    git push origin feature/YourFeatureName 
    ```

* **Open a Pull Request (PR): Describe your changes clearly and link any related issues**
## Setup Instructions
* **a. Clone this repository on your local machine:**
    ```bash
    git clone [https://github.com/rollingsmajiwa/smartacademic-frontend.git](https://github.com/rollingsmajiwa/smartacademic-frontend.git)
    ```
    ```bash
    cd smartacademic-frontend
    ```
* **b. Install Dependencies:**
    ```bash
    npm install
    ```
* **c. Configure environment variables:
        Create a .env file in the root directory and link your running backend API URL and Google Client ID:**
    ```bash
    VITE_API_BASE_URL=[http://127.0.0.1:8000](http://127.0.0.1:8000)
    VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
    ```
* **d. Start the development server**
    ```bash
    npm run dev
    ```
## Screenshots
## Author
**Rollings Majiwa**

**Github:**[https://github.com/rollingsmajiwa](https://github.com/rollingsmajiwa)

**Email:**[rollingsmajiwa@gmail.com](rollingsmajiwa@gmail.com)

## Get Started
**Interested in the code behind SmartAcademic Frontend? You can reach me directly via my profile or open an issue for collaboration.**[Visit My Github Profile](https://github.com/rollingsmajiwa)