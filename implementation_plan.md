# Integrate PDFusion Digital Library ("Resources" Tab)

This plan details the steps required to integrate Yaswanth Yashu's PDFusion digital library (`pdflib-v0.01`) as a new **"Resources"** tab inside the student dashboard. The data will be stored in the existing local **MariaDB** container, seeded from the provided CSV files, and connected to the Next.js frontend via serverless API routes.

## User Review Required

> [!IMPORTANT]
> **Docker Port Mapping Update:** Exposing the MariaDB port `3306:3306` in `backend/docker-compose.yml` is required so that the Next.js host application can connect directly to MariaDB. This requires restarting the Docker containers (`docker compose down && docker compose up -d`).

> [!WARNING]
> **Dependencies:** We will install `mysql2` in the `frontend` application to connect and run queries against MariaDB.

---

## Proposed Changes

### Database Configuration & Docker Update

#### [MODIFY] [docker-compose.yml](file:///c:/Users/seshu/vyomanta/backend/docker-compose.yml)
- Add port mapping `3306:3306` to the `mariadb` service definition.

#### [MODIFY] [.env](file:///c:/Users/seshu/vyomanta/frontend/.env)
- Add database connection environment variables:
  ```env
  DB_HOST="127.0.0.1"
  DB_PORT="3306"
  DB_USER="root"
  DB_PASSWORD="123"
  DB_NAME="pdf_resources_db"
  ```

---

### Seeding Script & Database Bootstrapping

#### [NEW] [seed_resources.js](file:///c:/Users/seshu/vyomanta/backend/seed_resources.js)
- Write a Node.js database bootstrapping and seeding script:
  1. Connect to MariaDB as `root` (password `123`).
  2. Create database `pdf_resources_db` if not exists.
  3. Create table `pdf_categories` matching fields: `id` (VARCHAR), `category` (VARCHAR), `subcategory` (VARCHAR), timestamps.
  4. Create table `pdf_resources` matching fields: `id` (VARCHAR), `category_id` (VARCHAR), `name` (VARCHAR), `file_link` (TEXT), `thumbnail` (TEXT), timestamps.
  5. Create SQL View `pdf_library_view` joining `pdf_resources` and `pdf_categories`.
  6. Read and parse `pdf_categories_rows.csv` and insert rows (handling duplicates).
  7. Read and parse `pdf_resources_rows (1).csv` and insert rows.

---

### Backend API Layer in Next.js

#### [MODIFY] [package.json](file:///c:/Users/seshu/vyomanta/frontend/package.json)
- Add `mysql2` (version `^3.11.0` or latest) to the `dependencies` block.

#### [NEW] [db.js](file:///c:/Users/seshu/vyomanta/frontend/lib/db.js)
- Create a MySQL pool using `mysql2/promise` connected with the env vars.

#### [NEW] [route.js](file:///c:/Users/seshu/vyomanta/frontend/app/api/resources/categories/route.js)
- Create a handler querying `pdf_categories` to return all category/subcategory combinations.

#### [NEW] [route.js](file:///c:/Users/seshu/vyomanta/frontend/app/api/resources/list/route.js)
- Create a query handler querying `pdf_library_view` with filters:
  - `search`: Search term (fuzzy query on `name` column).
  - `category`: Category filter.
  - `subcategory`: Subcategory filter.
  - `sortBy`: Sorting by `newest` (created_at DESC) or `title` (name ASC).

---

### Copy Static Resources to Public Folder
We will copy the static directory contents from `pdflib-v0.01/public/src` to `frontend/public/src`:
- `public/src/DSA-comapny-wise-questions/questions-data.json`
- `public/src/ds-res/das-resource.md`
- `public/src/markdown-cheatsheets/*.md` (all 198 cheatsheets)

---

### Frontend Views & Page Integration

#### [NEW] [resources.css](file:///c:/Users/seshu/vyomanta/frontend/app/resources/resources.css)
- Custom CSS for rendering the DSA study guide (collapsible sidebar, responsive TOC, markdown styling) and Markdown cheat sheets layout.

#### [NEW] [page.jsx](file:///c:/Users/seshu/vyomanta/frontend/app/resources/page.jsx)
- Implement the client-side router/wrapper.
- Hold `currentTab` state: `'hub'` (dashboard), `'library'` (PDF grid), `'cheatsheets'` (cheat sheets listing), `'cheatsheet'` (single cheat sheet), `'dsa'` (DSA portal), `'dsa/company'` (company questions list), `'dsa/resources'` (interactive DSA study guide).
- Incorporate existing design aesthetic (Outfit/Inter fonts, HSL glow gradients, matching cards style).

#### [NEW] [ResourcesHub.jsx](file:///c:/Users/seshu/vyomanta/frontend/components/ResourcesHub.jsx)
- Implement the card-based dashboard matching Image 1:
  - **PDF Library** (Explore Library -> navigates to `library` view).
  - **Cheat Sheets** (Explore Sheets -> navigates to `cheatsheets` view).
  - **DSA Practice** (Start Practicing -> navigates to `dsa` view).

#### [NEW] [ResourcesLibrary.jsx](file:///c:/Users/seshu/vyomanta/frontend/components/ResourcesLibrary.jsx)
- Implement the PDF Search & Grid View (Image 2 style):
  - Fetches dynamic resources and categories from `/api/resources/list` and `/api/resources/categories`.
  - Integrates a nice PDF preview modal/overlay matching the original PDFViewer logic.

#### [NEW] [ResourcesCheatSheets.jsx](file:///c:/Users/seshu/vyomanta/frontend/components/ResourcesCheatSheets.jsx)
- Implement the categories listing and search of static cheat sheets (Image 3 style).

#### [NEW] [ResourcesMarkdownCheatSheet.jsx](file:///c:/Users/seshu/vyomanta/frontend/components/ResourcesMarkdownCheatSheet.jsx)
- Parse and render individual `.md` cheat sheet files fetched from `/src/markdown-cheatsheets/`.

#### [NEW] [ResourcesDSA.jsx](file:///c:/Users/seshu/vyomanta/frontend/components/ResourcesDSA.jsx)
- Collapsible options view matching Image 4 (Company-wise Questions & Learning Resources).

#### [NEW] [ResourcesDSACompanyWise.jsx](file:///c:/Users/seshu/vyomanta/frontend/components/ResourcesDSACompanyWise.jsx)
- Searchable and paginated lists of questions by company from `questions-data.json`.

#### [NEW] [ResourcesDSAResources.jsx](file:///c:/Users/seshu/vyomanta/frontend/components/ResourcesDSAResources.jsx)
- Render collapsible table of contents and content sections from `das-resource.md`.

#### [MODIFY] [Sidebar.jsx](file:///c:/Users/seshu/vyomanta/frontend/components/Sidebar.jsx)
- Add `/resources` ("Resources") with a folder/library icon to the student navigation sidebar.

#### [MODIFY] [MobileNav.jsx](file:///c:/Users/seshu/vyomanta/frontend/components/MobileNav.jsx)
- Add `/resources` item to the mobile navigation.

---

## Verification Plan

### Automated Tests
- Run database seeding script: `node backend/seed_resources.js` to ensure categories and resources insert cleanly.
- Verify frontend builds and runs: `npm run build` or `npm run dev` to ensure no linting/compilation issues.

### Manual Verification
- Log in as student Aarav Mehta, click the "Resources" tab.
- Click **PDF Library**: Check category/subcategory drop-downs, search bar, newest/title sorting, and preview PDF files (embedded preview should open in a modal).
- Click **Cheat Sheets**: Ensure they group by category, clicking a sheet opens its parsed markdown layout correctly.
- Click **DSA Practice**: Open Company Questions, select a company (e.g. Amazon, Google), and check list of questions. Verify opening Learning Resources renders the collapsible DSA guide.
