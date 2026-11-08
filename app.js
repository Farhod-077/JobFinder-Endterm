"use strict";

(() => {
    const data = window.JobFinderData;

    const keys = {
        jobs: "jobfinder.customJobs.v1",
        favorites: "jobfinder.favorites.v1",
        theme: "jobfinder.theme.v1"
    };

    const memory = new Map();
    let noticeTimer;
    let refreshJobs = () => {};

    function readStorage(key, fallback) {
        if (memory.has(key)) {
            return memory.get(key);
        }

        try {
            const raw = localStorage.getItem(key);
            return raw === null ? fallback : JSON.parse(raw);
        } catch {
            return fallback;
        }
    }

    function writeStorage(key, value) {
        memory.set(key, value);

        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            return false;
        }
    }

    function createElement(tag, className = "", text = "") {
        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        element.textContent = text;
        return element;
    }

    function showNotice(message) {
        const notice = document.getElementById("notice");

        if (!notice) {
            return;
        }

        clearTimeout(noticeTimer);
        notice.textContent = message;
        notice.hidden = false;

        noticeTimer = setTimeout(() => {
            notice.hidden = true;
        }, 5000);
    }

    function isCustomJob(job) {
        if (!job || typeof job !== "object") {
            return false;
        }

        const fields = [
            "id",
            "title",
            "companyId",
            "companyName",
            "location",
            "category",
            "employmentType",
            "workMode",
            "description",
            "createdAt"
        ];

        return fields.every(field =>
            typeof job[field] === "string" && job[field].trim().length > 0
        ) &&
            job.id.startsWith("custom-") &&
            Number.isFinite(job.salary) &&
            job.salary >= 1 &&
            job.salary <= 100000 &&
            Number.isFinite(Date.parse(job.createdAt));
    }

    function getCustomJobs() {
        const stored = readStorage(keys.jobs, []);
        return Array.isArray(stored) ? stored.filter(isCustomJob) : [];
    }

    function getJobs() {
        return [...data.jobs, ...getCustomJobs()];
    }

    function getFavorites() {
        const stored = readStorage(keys.favorites, []);

        if (!Array.isArray(stored)) {
            return [];
        }

        const available = new Set(getJobs().map(job => job.id));

        return [...new Set(stored.filter(id =>
            typeof id === "string" && available.has(id)
        ))];
    }

    function getCompanies() {
        const companies = data.companies.map(company => ({ ...company }));

        for (const job of getCustomJobs()) {
            if (!companies.some(company => company.id === job.companyId)) {
                companies.push({
                    id: job.companyId,
                    name: job.companyName,
                    industry: "Community Employer",
                    description: "An employer added through the local demonstration form."
                });
            }
        }

        return companies;
    }

    function getCompanyName(job) {
        return job.companyName ||
            data.companies.find(company => company.id === job.companyId)?.name ||
            "Unknown Company";
    }

    function formatSalary(salary) {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0
        }).format(salary);
    }

    function sortJobs(jobs, order) {
        const sorted = [...jobs];

        switch (order) {
            case "salary-desc":
                return sorted.sort((a, b) => b.salary - a.salary);
            case "salary-asc":
                return sorted.sort((a, b) => a.salary - b.salary);
            case "title":
                return sorted.sort((a, b) => a.title.localeCompare(b.title));
            default:
                return sorted.sort((a, b) =>
                    Date.parse(b.createdAt) - Date.parse(a.createdAt)
                );
        }
    }

    function filterJobs(jobs, filters) {
        const query = filters.search.trim().toLowerCase();
        const favorites = new Set(getFavorites());

        return jobs.filter(job => {
            const searchable = [
                job.title,
                getCompanyName(job),
                job.category,
                job.description,
                job.location
            ].join(" ").toLowerCase();

            return searchable.includes(query) &&
                (!filters.location || job.location === filters.location) &&
                (!filters.category || job.category === filters.category) &&
                (!filters.company || job.companyId === filters.company) &&
                (!filters.type || job.employmentType === filters.type) &&
                (!filters.mode || job.workMode === filters.mode) &&
                (!filters.savedOnly || favorites.has(job.id));
        });
    }

    function updateSavedButtons() {
        const favorites = new Set(getFavorites());

        document.querySelectorAll("[data-save-id]").forEach(button => {
            const saved = favorites.has(button.dataset.saveId);
            button.textContent = saved ? "Saved ✓" : "Save Job";
            button.setAttribute("aria-pressed", String(saved));
            button.classList.toggle("btn-primary", saved);
            button.classList.toggle("btn-outline-primary", !saved);
        });

        const count = document.getElementById("saved-count");

        if (count) {
            count.textContent = String(favorites.size);
        }
    }

    function toggleFavorite(jobId) {
        const favorites = getFavorites();
        const alreadySaved = favorites.includes(jobId);

        const updated = alreadySaved
            ? favorites.filter(id => id !== jobId)
            : [...favorites, jobId];

        const persisted = writeStorage(keys.favorites, updated);

        updateSavedButtons();
        refreshJobs();

        const message = alreadySaved
            ? "Job removed from saved jobs."
            : "Job added to saved jobs.";

        showNotice(persisted ? message : `${message} Storage unavailable: this page only.`);
    }

    function createJobCard(job) {
        const article = createElement("article", "job-card");
        const top = createElement("div", "job-card-top");
        const heading = createElement("div");
        const companyName = getCompanyName(job);

        heading.append(
            createElement("h3", "", job.title),
            createElement("p", "job-company", companyName),
            createElement("p", "job-location", job.location)
        );

        const logo = createElement("div", "company-logo", companyName.charAt(0));
        logo.setAttribute("aria-hidden", "true");
        top.append(heading, logo);

        const tags = createElement("div", "tags");

        for (const value of [job.category, job.employmentType, job.workMode]) {
            tags.append(createElement("span", "tag", value));
        }

        const salary = createElement("p", "salary", `${formatSalary(job.salary)} / month`);
        const date = createElement(
            "p",
            "job-date",
            `Posted ${new Date(job.createdAt).toLocaleDateString("en-GB")}`
        );

        const actions = createElement("div", "card-actions");
        const saveButton = createElement("button", "btn btn-outline-primary", "Save Job");
        saveButton.type = "button";
        saveButton.dataset.saveId = job.id;
        saveButton.setAttribute("aria-pressed", "false");
        saveButton.addEventListener("click", () => toggleFavorite(job.id));

        const detailsButton = createElement("button", "btn btn-outline-secondary", "View Details");
        detailsButton.type = "button";
        detailsButton.setAttribute("aria-expanded", "false");

        const description = createElement("p", "job-description", job.description);
        description.id = `description-${job.id}`;
        description.hidden = true;
        detailsButton.setAttribute("aria-controls", description.id);

        detailsButton.addEventListener("click", event => {
            description.hidden = !description.hidden;
            event.currentTarget.setAttribute("aria-expanded", String(!description.hidden));
            event.currentTarget.textContent = description.hidden ? "View Details" : "Hide Details";
        });

        actions.append(saveButton, detailsButton);

        if (job.id.startsWith("custom-")) {
            const deleteButton = createElement("button", "btn btn-outline-danger", "Delete My Job");
            deleteButton.type = "button";

            deleteButton.addEventListener("click", () => {
                if (!window.confirm(`Delete "${job.title}" from this browser?`)) {
                    return;
                }

                const remainingJobs = getCustomJobs().filter(item => item.id !== job.id);
                const jobsSaved = writeStorage(keys.jobs, remainingJobs);
                const favoritesSaved = writeStorage(keys.favorites, getFavorites());

                article.remove();
                refreshJobs();
                updateSavedButtons();

                showNotice(
                    jobsSaved && favoritesSaved
                        ? "Your demo job was deleted."
                        : "Removed on this page. Storage is unavailable."
                );
            });

            actions.append(deleteButton);
        }

        article.append(top, tags, salary, date, actions, description);
        return article;
    }

    function renderJobs(jobs, container) {
        const fragment = document.createDocumentFragment();

        for (const job of jobs) {
            fragment.append(createJobCard(job));
        }

        container.replaceChildren(fragment);
        updateSavedButtons();
    }

    function renderTable(jobs) {
        const body = document.getElementById("jobs-table-body");
        const fragment = document.createDocumentFragment();

        for (const job of jobs) {
            const row = createElement("tr");

            for (const value of [
                job.title,
                getCompanyName(job),
                job.location,
                job.employmentType,
                job.workMode,
                formatSalary(job.salary)
            ]) {
                row.append(createElement("td", "", value));
            }

            fragment.append(row);
        }

        if (jobs.length === 0) {
            const row = createElement("tr");
            const cell = createElement("td", "text-center", "No matching jobs.");
            cell.colSpan = 6;
            row.append(cell);
            fragment.append(row);
        }

        body.replaceChildren(fragment);
    }

    function populateSelect(select, values) {
        const placeholder = select.options[0].cloneNode(true);
        select.replaceChildren(placeholder);

        for (const value of values) {
            const option = createElement("option");

            if (typeof value === "string") {
                option.value = value;
                option.textContent = value;
            } else {
                option.value = value.value;
                option.textContent = value.label;
            }

            select.append(option);
        }
    }

    function renderShell() {
        const page = document.body.dataset.page;
        const header = document.getElementById("site-header");

        header.innerHTML = `
            <nav class="navbar navbar-expand-xl" aria-label="Main navigation">
                <div class="container">
                    <a class="navbar-brand" href="index.html">
                        <span class="brand-mark" aria-hidden="true">J</span>
                        JobFinder
                    </a>
                    <button class="navbar-toggler" type="button"
                            data-bs-toggle="collapse" data-bs-target="#main-navigation"
                            aria-controls="main-navigation" aria-expanded="false"
                            aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="main-navigation">
                        <ul class="navbar-nav mx-auto gap-xl-2">
                            <li class="nav-item">
                                <a class="nav-link" data-page-link="home" href="index.html">Home</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" data-page-link="jobs" href="jobs.html">Find a Job</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" data-page-link="companies" href="companies.html">Companies</a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" data-page-link="contact" href="contact.html">Contact Us</a>
                            </li>
                        </ul>
                        <div class="header-actions">
                            <a class="btn btn-outline-primary" href="jobs.html?saved=1">
                                Saved <span id="saved-count">0</span>
                            </a>
                            <button id="theme-toggle" class="btn btn-outline-secondary"
                                    type="button" aria-pressed="false">Dark Mode</button>
                            <a class="btn btn-primary" data-page-link="post"
                               href="post-job.html">Post a Job</a>
                        </div>
                    </div>
                </div>
            </nav>
        `;

        document.querySelectorAll("[data-page-link]").forEach(link => {
            if (link.dataset.pageLink === page) {
                link.classList.add("active");
                link.setAttribute("aria-current", "page");
            }
        });

        document.getElementById("site-footer").innerHTML = `
            <div class="container">
                <div class="footer-content">
                    <div>
                        <h2>JobFinder</h2>
                        <p>We connect talent with opportunities.</p>
                        <p>Educational demo. Listings are sample data.</p>
                    </div>
                    <div>
                        <h3>Explore</h3>
                        <a href="jobs.html">Browse Jobs</a>
                        <a href="companies.html">Browse Companies</a>
                        <a href="jobs.html?saved=1">Saved Jobs</a>
                    </div>
                    <div>
                        <h3>Get Started</h3>
                        <a href="post-job.html">Post a Job</a>
                        <a href="contact.html">Contact Us</a>
                    </div>
                </div>
                <div class="footer-bottom">
                    © ${new Date().getFullYear()} JobFinder. Web Technologies Endterm Project.
                </div>
            </div>
        `;

        updateSavedButtons();

        document.addEventListener("keydown", event => {
            if (event.key !== "Escape") {
                return;
            }

            const navigation = document.getElementById("main-navigation");

            if (navigation.classList.contains("show") && window.bootstrap) {
                bootstrap.Collapse.getOrCreateInstance(navigation, { toggle: false }).hide();
                document.querySelector(".navbar-toggler").focus();
            }
        });
    }

    function initTheme() {
        const button = document.getElementById("theme-toggle");

        function applyTheme(theme) {
            document.documentElement.setAttribute("data-bs-theme", theme);
            button.textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
            button.setAttribute("aria-pressed", String(theme === "dark"));
        }

        applyTheme(readStorage(keys.theme, "light") === "dark" ? "dark" : "light");

        button.addEventListener("click", () => {
            const theme = document.documentElement.getAttribute("data-bs-theme") === "dark"
                ? "light"
                : "dark";

            applyTheme(theme);

            if (!writeStorage(keys.theme, theme)) {
                showNotice("Theme changed. Storage unavailable: this page only.");
            }
        });
    }

    function initHome() {
        const jobs = getJobs();
        const container = document.getElementById("category-list");

        for (const category of data.categories) {
            const count = jobs.filter(job => job.category === category.name).length;
            const link = createElement("a", "category-card");
            link.href = `jobs.html?category=${encodeURIComponent(category.name)}`;

            const icon = createElement("span", "cat-icon", category.icon);
            icon.setAttribute("aria-hidden", "true");

            link.append(
                icon,
                createElement("h3", "", category.name),
                createElement("p", "", `${count} open ${count === 1 ? "position" : "positions"}`)
            );

            container.append(link);
        }

        document.getElementById("home-stats").textContent =
            `${jobs.length} demo vacancies · ${getCompanies().length} companies · One next step`;

        renderJobs(sortJobs(jobs, "newest").slice(0, 3), document.getElementById("featured-jobs"));

        document.getElementById("home-search").addEventListener("submit", event => {
            event.preventDefault();

            const query = document.getElementById("home-query").value.trim();
            const params = new URLSearchParams();

            if (query) {
                params.set("search", query);
            }

            window.location.href = `jobs.html${params.size ? `?${params}` : ""}`;
        });
    }

    function initJobs() {
        const form = document.getElementById("filters-form");
        const search = document.getElementById("job-search");
        const location = document.getElementById("filter-location");
        const category = document.getElementById("filter-category");
        const company = document.getElementById("filter-company");
        const type = document.getElementById("filter-type");
        const mode = document.getElementById("filter-mode");
        const savedOnly = document.getElementById("saved-only");
        const sort = document.getElementById("job-sort");
        const jobs = getJobs();

        populateSelect(location, [...new Set(jobs.map(job => job.location))].sort());
        populateSelect(category, data.categories.map(item => item.name));
        populateSelect(company, getCompanies().map(item => ({
            value: item.id,
            label: item.name
        })));

        const params = new URLSearchParams(window.location.search);
        search.value = (params.get("search") || "").slice(0, 100);
        category.value = params.get("category") || "";
        company.value = params.get("company") || "";
        savedOnly.checked = params.get("saved") === "1";

        if (category.selectedIndex < 0) {
            category.selectedIndex = 0;
        }

        if (company.selectedIndex < 0) {
            company.selectedIndex = 0;
        }

        refreshJobs = () => {
            const filtered = filterJobs(getJobs(), {
                search: search.value,
                location: location.value,
                category: category.value,
                company: company.value,
                type: type.value,
                mode: mode.value,
                savedOnly: savedOnly.checked
            });

            const sorted = sortJobs(filtered, sort.value);

            renderJobs(sorted, document.getElementById("job-list"));
            renderTable(sorted);

            document.getElementById("results-count").textContent =
                `${sorted.length} ${sorted.length === 1 ? "job" : "jobs"} found`;

            document.getElementById("empty-state").hidden = sorted.length > 0;
        };

        function resetFilters() {
            form.reset();
            sort.value = "newest";
            refreshJobs();
            search.focus();
        }

        search.addEventListener("input", refreshJobs);
        form.addEventListener("change", refreshJobs);
        sort.addEventListener("change", refreshJobs);

        form.addEventListener("submit", event => {
            event.preventDefault();
            refreshJobs();
        });

        document.getElementById("reset-filters").addEventListener("click", resetFilters);
        document.getElementById("empty-reset").addEventListener("click", resetFilters);

        refreshJobs();
    }

    function initCompanies() {
        const search = document.getElementById("company-search");
        const container = document.getElementById("company-list");

        function renderCompanies() {
            const query = search.value.trim().toLowerCase();

            const companies = getCompanies().filter(company =>
                `${company.name} ${company.industry}`.toLowerCase().includes(query)
            );

            container.replaceChildren();

            for (const company of companies) {
                const count = getJobs().filter(job => job.companyId === company.id).length;
                const card = createElement("article", "company-card");
                const logo = createElement("div", "company-logo", company.name.charAt(0));
                logo.setAttribute("aria-hidden", "true");

                const link = createElement(
                    "a",
                    "btn btn-outline-primary",
                    `${count} Open ${count === 1 ? "Job" : "Jobs"} →`
                );

                link.href = `jobs.html?company=${encodeURIComponent(company.id)}`;

                card.append(
                    logo,
                    createElement("h3", "", company.name),
                    createElement("p", "tag", company.industry),
                    createElement("p", "company-description", company.description),
                    link
                );

                container.append(card);
            }

            document.getElementById("company-count").textContent =
                `${companies.length} ${companies.length === 1 ? "company" : "companies"} found`;

            document.getElementById("company-empty").hidden = companies.length > 0;
        }

        search.addEventListener("input", renderCompanies);
        renderCompanies();
    }

    function validateValues(values, kind) {
        const errors = {};

        function checkLength(name, label, min, max) {
            const value = String(values[name] || "").trim();

            if (!value) {
                errors[name] = `${label} is required.`;
            } else if (value.length < min || value.length > max) {
                errors[name] = `${label} must contain ${min}–${max} characters.`;
            }
        }

        function checkEmail(name) {
            const email = String(values[name] || "").trim();

            if (!email) {
                errors[name] = "Email is required.";
            } else if (email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
                errors[name] = "Enter a valid email address.";
            }
        }

        if (kind === "post") {
            checkLength("title", "Job title", 3, 80);
            checkLength("company", "Company name", 2, 80);
            checkLength("location", "Location", 2, 60);
            checkLength("description", "Description", 50, 2000);
            checkEmail("email");

            if (!data.categories.some(category => category.name === values.category)) {
                errors.category = "Select a category.";
            }

            if (!["Full-time", "Part-time", "Internship"].includes(values.employmentType)) {
                errors.employmentType = "Select an employment type.";
            }

            if (!["Office", "Hybrid", "Remote"].includes(values.workMode)) {
                errors.workMode = "Select a work mode.";
            }

            const salary = Number(values.salary);

            if (!values.salary || !Number.isInteger(salary) || salary < 1 || salary > 100000) {
                errors.salary = "Enter a whole monthly salary from 1 to 100,000 USD.";
            }
        } else {
            checkLength("fullName", "Full name", 2, 80);
            checkLength("message", "Message", 20, 1000);
            checkEmail("contactEmail");

            if (!["Finding a job", "Posting a job", "Technical issue", "Other"].includes(values.subject)) {
                errors.subject = "Select a subject.";
            }

            if (!values.consent) {
                errors.consent = "Please confirm that you understand the demo mode.";
            }
        }

        return errors;
    }

    function getFormValues(form) {
        return Object.fromEntries(
            [...new FormData(form).entries()].map(([name, value]) => [
                name,
                typeof value === "string" ? value.trim() : value
            ])
        );
    }

    function showFieldError(field, message) {
        const error = document.getElementById(`${field.id}-error`);

        field.classList.toggle("is-invalid", Boolean(message));
        field.setAttribute("aria-invalid", String(Boolean(message)));

        if (error) {
            error.textContent = message || "";
        }
    }

    function setupValidation(form, kind, successCallback) {
        let submitted = false;

        const fields = [...form.querySelectorAll("input[name], select[name], textarea[name]")];

        function validateAll() {
            const values = getFormValues(form);
            const errors = validateValues(values, kind);

            fields.forEach(field => showFieldError(field, errors[field.name]));

            return { values, errors };
        }

        function handleEdit(event) {
            const success = document.getElementById(`${kind === "post" ? "post" : "contact"}-success`);
            success.hidden = true;

            if (submitted && event.target.matches("input, select, textarea")) {
                const errors = validateValues(getFormValues(form), kind);
                showFieldError(event.target, errors[event.target.name]);
            }
        }

        form.addEventListener("input", handleEdit);
        form.addEventListener("change", handleEdit);

        form.addEventListener("submit", event => {
            event.preventDefault();
            submitted = true;

            const { values, errors } = validateAll();

            if (Object.keys(errors).length > 0) {
                const firstInvalid = fields.find(field => errors[field.name]);
                firstInvalid.focus();
                showNotice("Please correct the highlighted fields.");
                return;
            }

            successCallback(values);
            form.reset();
            submitted = false;

            fields.forEach(field => {
                field.classList.remove("is-invalid");
                field.removeAttribute("aria-invalid");
            });

            updateCounters();
        });
    }

    function updateCounters() {
        for (const id of ["description", "message"]) {
            const field = document.getElementById(id);
            const counter = document.getElementById(`${id}-count`);

            if (field && counter) {
                counter.textContent = `${field.value.length} / ${field.maxLength}`;
            }
        }
    }

    function initCounters() {
        for (const id of ["description", "message"]) {
            const field = document.getElementById(id);

            if (field) {
                field.addEventListener("input", updateCounters);
            }
        }

        updateCounters();
    }

    function createId() {
        if (window.crypto && typeof window.crypto.randomUUID === "function") {
            return window.crypto.randomUUID();
        }

        return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }

    function initPostForm() {
        populateSelect(
            document.getElementById("category"),
            data.categories.map(category => category.name)
        );

        setupValidation(document.getElementById("post-form"), "post", values => {
            const matchingCompany = getCompanies().find(company =>
                company.name.toLowerCase() === values.company.toLowerCase()
            );

            const id = `custom-${createId()}`;

            const job = {
                id,
                title: values.title,
                companyId: matchingCompany ? matchingCompany.id : `company-${id}`,
                companyName: matchingCompany ? matchingCompany.name : values.company,
                location: values.location,
                category: values.category,
                employmentType: values.employmentType,
                workMode: values.workMode,
                salary: Number(values.salary),
                description: values.description,
                createdAt: new Date().toISOString()
            };

            const persisted = writeStorage(keys.jobs, [...getCustomJobs(), job]);
            const success = document.getElementById("post-success");
            const link = document.getElementById("view-posted-job");

            document.getElementById("post-success-text").textContent = persisted
                ? "Your demo vacancy was saved in this browser and added to the directory."
                : "The form is valid, but browser storage is unavailable. Your vacancy was not saved permanently.";

            link.hidden = !persisted;
            link.href = `jobs.html?search=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.companyId)}`;
            success.hidden = false;
        });
    }

    function initContactForm() {
        setupValidation(document.getElementById("contact-form"), "contact", values => {
            const success = document.getElementById("contact-success");

            success.textContent =
                `Thank you, ${values.fullName}. Your form passed validation. Demo mode: no message was sent or stored.`;

            success.hidden = false;
        });
    }

    document.addEventListener("DOMContentLoaded", () => {
        renderShell();
        initTheme();
        initCounters();

        switch (document.body.dataset.page) {
            case "home":
                initHome();
                break;
            case "jobs":
                initJobs();
                break;
            case "companies":
                initCompanies();
                break;
            case "post":
                initPostForm();
                break;
            case "contact":
                initContactForm();
                break;
        }
    });
})();