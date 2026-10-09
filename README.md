<div align="center">

# MVS Construction Estimation

**A web-based tool for construction estimation and electrical & plumbing planning.**

[Repository](https://github.com/MVS-Thamizharasu/electrical-plumbing) · [Live Demo](#-live-demo) · [Screenshots](#-screenshots)

</div>

---

## Overview

MVS Construction Estimation is a project for organizing construction-related estimation and home-planning workflows. The repository includes a web interface, shared project data, and a Flutter application.

> **Project status:** Deployment details and feature coverage should be verified against the current build before publishing this README as final documentation.

## Features

- Construction-estimation and home-planning interface.
- Electrical and plumbing planning sections.
- Room-based planning and item selection in the web interface.
- Shared data directory for reusable project data.
- Flutter application source included in `FlutterApp/`.
- A Jupyter notebook for share-market trend analysis is also present in the repository.

*Only describe features that are present and working in the current version. Update this list as the project evolves.*

## Screenshots

Add screenshots captured from the actual running application to the `screenshots/` directory, then update the image paths below.

| Web application | Electrical / plumbing planning |
|---|---|
| `screenshots/dashboard.png` | `screenshots/electrical-plumbing.png` |

Once the images exist, replace this table with:

```md
![Application dashboard](screenshots/dashboard.png)
![Electrical and plumbing planning](screenshots/electrical-plumbing.png)
```

**Suggested screenshots**
1. Main dashboard / home page.
2. Electrical or plumbing item selection.
3. Room-wise planning or estimation summary.
4. Mobile layout.

Do not use screenshots of the GitHub repository as product screenshots; capture the actual app instead.

## Live Demo

**Live website:** Add and verify the deployed website URL here before publishing, for example:

`https://YOUR-VERIFIED-DEPLOYMENT-URL/`

To check the configured URL, open the repository on GitHub and go to **Settings → Pages**. If the site is deployed using a custom domain, verify the domain and HTTPS status there as well.

## Repository Structure

```text
electrical-plumbing/
├── .github/
│   └── workflows/       # GitHub Actions workflows
├── FlutterApp/          # Flutter application source
├── Web/                 # Web interface (HTML, CSS, JavaScript)
├── shared/              # Shared project data
├── .gitignore
├── .stylelintrc.json
├── Share_Market_Trend_Analysis_ML.ipynb
└── home-planning-sections.txt
```

The exact files may change as the project is updated. Check the current `main` branch for the latest structure.

## Getting Started

### Option A: Run the web interface locally

1. Install Git.
2. Clone the repository:

   ```bash
   git clone https://github.com/MVS-Thamizharasu/electrical-plumbing.git
   cd electrical-plumbing
   ```

3. Open the `Web/` folder.
4. If the page is static HTML, CSS, and JavaScript, open `Web/index.html` in a browser or use VS Code with Live Server.
5. If the page loads shared JSON data using `fetch()`, run it through a local HTTP server instead of opening the file directly. For example, from the repository root:

   ```bash
   python -m http.server 8000
   ```

   Then open `http://localhost:8000/Web/` in your browser.

6. Test the main page, item selection, calculations, and mobile layout.

> If the app expects API services, environment variables, or a particular data path, follow those requirements in the source code. Do not assume a backend is required or available without checking the current implementation.

### Option B: Open the Flutter application

The repository contains a `FlutterApp/` directory. To run it:

1. Install the Flutter SDK and required platform tools.
2. Open a terminal in the Flutter project directory.
3. Run:

   ```bash
   cd FlutterApp
   flutter pub get
   flutter run
   ```

These commands assume `FlutterApp/` contains a valid Flutter project with a `pubspec.yaml`. If it does not, inspect the directory and use the actual project path.

## Technology

Based on the repository contents, the project includes:

- HTML, CSS, and JavaScript for the web interface.
- Flutter source code.
- Shared data files.
- A Jupyter notebook for data analysis.

Add exact versions, libraries, and services only after confirming them from the current source files.

## Development Workflow

After making changes:

```bash
git status
git add <files-you-intend-to-commit>
git commit -m "Describe your changes"
git push origin main
```

Avoid `git add .` if backup files, databases, credentials, or other unwanted files are present. Never commit API keys, passwords, access tokens, or private user data.

## Screenshots and Assets Checklist

- [ ] Create a `screenshots/` folder at the repository root.
- [ ] Capture real screenshots from the running application.
- [ ] Save them as `dashboard.png`, `electrical-plumbing.png`, and optionally `mobile-view.png`.
- [ ] Add the images and update the screenshot section.
- [ ] Verify every image and demo link on GitHub.

## Roadmap

- [ ] Add verified live demo URL.
- [ ] Add real application screenshots.
- [ ] Document supported estimation and calculation workflows.
- [ ] Document data format and configuration.
- [ ] Add setup instructions verified against the current project.

## Contributing

Suggestions and bug reports are welcome. Open a GitHub issue with:
- A clear description of the problem or suggestion.
- Steps to reproduce the issue.
- Screenshots or error messages when relevant.

## License

No license information has been confirmed in this README. Add a `LICENSE` file and update this section if you intend to publish the project under a specific open-source license.

---

<div align="center">

**MVS Construction Estimation**  
Built and maintained by [MVS-Thamizharasu](https://github.com/MVS-Thamizharasu)

</div>
