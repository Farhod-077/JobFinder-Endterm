# JobFinder — Endterm Project

JobFinder is a responsive five-page job search website continued from our midterm project.

The endterm version preserves the original topic, core pages, navigation and blue visual identity while introducing JavaScript and jQuery interactions.

## Team

| Member | Contribution |
|---|---|
| Sapayev Farkhod | HTML pages, responsive CSS, Bootstrap navigation and page layouts. |
| Orynbassarov Yerdan | Job and company data, dynamic rendering, search, filters, sorting, saved jobs and theme switching. |
| Tokmaganbet Burkhan | Form validation, local job creation and deletion, jQuery FAQ, testing and README documentation. |

Group: SE-2525

## Published Website

https://farhod-077.github.io/JobFinder-Endterm/

## Pages

1. index.html — homepage, working search, dynamic categories and latest vacancies.
2. jobs.html — searchable job directory, filters, sorting, saved jobs and summary table.
3. companies.html — searchable employer directory with vacancy counts.
4. post-job.html — validated form for creating local demonstration vacancies.
5. contact.html — validated feedback form and interactive jQuery FAQ.

## Technologies

- HTML5
- CSS3
- Bootstrap 5.3.3
- JavaScript
- jQuery 3.7.1
- localStorage

## Project Structure

- index.html
- jobs.html
- companies.html
- post-job.html
- contact.html
- styles.css
- data.js
- app.js
- jquery-features.js
- README.md

## Running Locally

1. Open the project folder in Visual Studio Code.
2. Start index.html with the Live Server extension.
3. Keep all pages on the same local server address.
4. An internet connection is required for Bootstrap and jQuery CDN resources.

Alternatively, start a local HTTP server:

    python -m http.server 8000

Then open:

    http://localhost:8000

## Endterm Features

- Dynamic vacancy cards and table rows.
- Homepage search that opens the job directory with a query.
- Combined keyword, location, category, company, employment and work-mode filters.
- Salary, title and date sorting.
- Saved jobs with persistent local storage.
- Expandable vacancy descriptions.
- Light and dark themes.
- Responsive Bootstrap navigation.
- Searchable company cards and calculated vacancy counts.
- JavaScript validation for two substantial forms.
- Local vacancy creation and deletion.
- Character counters.
- Searchable jQuery FAQ with animations.
- Empty states, validation messages and status notifications.

## Requirements Mapping

| Requirement | Implementation |
|---|---|
| Five connected pages | All five HTML files |
| At least two arrays | jobs, companies and categories in data.js |
| At least two loop examples | for...of in renderJobs; forEach in setupValidation |
| Reusable functions | filterJobs, sortJobs, createJobCard, renderJobs, validateValues |
| Parameters and return values | filterJobs, sortJobs, formatSalary and validateValues |
| Dynamic content | Vacancy cards, table rows, categories and companies |
| DOM insertion | createElement and append |
| DOM removal | article.remove and replaceChildren |
| DOM updates | textContent, classList, hidden and setAttribute |
| Useful interface features | Search, filters, sorting, saved jobs, theme and details |
| JavaScript events | click, input, change, submit, keydown and DOMContentLoaded |
| Submission control | preventDefault in form handlers |
| Custom validation | validateValues and showFieldError |
| jQuery selector types | ID and class selectors |
| jQuery traversal | closest, find, siblings and children |
| jQuery user events | click and input |
| jQuery effects | slideToggle, slideUp, fadeIn and fadeOut |
| Responsive component | Bootstrap collapsible navigation |

## Manual Testing

### Navigation and Layout

1. Open all five pages through the navigation.
2. Confirm that the active page is highlighted.
3. Resize the browser to mobile width.
4. Open and close the navigation menu.
5. Press Escape while the mobile menu is open.
6. Confirm that content remains readable without page-level horizontal overflow.

### Search and Filters

1. Search for frontend from the homepage.
2. Confirm that the job directory displays matching vacancies.
3. Combine location, category and work-mode filters.
4. Check that all displayed results satisfy the selected conditions.
5. Search for a nonexistent keyword.
6. Confirm that the empty state appears.
7. Reset the filters.
8. Confirm that all vacancies return.

### Sorting and Table

1. Select Highest salary.
2. Confirm descending salary order.
3. Select Lowest salary.
4. Confirm ascending salary order.
5. Select Title A–Z.
6. Confirm alphabetical order.
7. Verify that the table matches the current card results.

### Saved Jobs

1. Save two vacancies.
2. Confirm that their buttons and the saved counter update.
3. Open Saved jobs.
4. Remove one vacancy from the saved list.
5. Confirm that it disappears from the saved results.
6. Refresh the page.
7. Confirm that the remaining saved vacancy persists.

### Theme

1. Switch to dark mode.
2. Navigate to another page.
3. Refresh the page.
4. Confirm that dark mode remains selected.
5. Switch back to light mode.

### Companies

1. Search for a company.
2. Confirm that the company count updates.
3. Open its vacancies.
4. Confirm that only that company's jobs are displayed.

### Vacancy Form

1. Submit an empty form.
2. Confirm that field-specific messages appear.
3. Enter spaces in required text fields.
4. Confirm that they are rejected.
5. Enter an invalid email.
6. Enter zero, a negative salary or a decimal salary.
7. Enter a description shorter than 50 characters.
8. Confirm that each invalid value is rejected.
9. Complete every field correctly.
10. Submit the form.
11. Open the created vacancy using View Your Job.
12. Refresh the page and confirm persistence.
13. Delete the vacancy and confirm its removal.

### Contact Form

1. Submit an empty form.
2. Test an invalid email and a short message.
3. Leave the confirmation checkbox unchecked.
4. Confirm that errors prevent successful submission.
5. Complete the form correctly.
6. Confirm that the success message explains the demonstration mode.

### jQuery FAQ

1. Open a question.
2. Open another question.
3. Confirm that the previous answer closes.
4. Search for saved.
5. Confirm that only matching FAQ items remain.
6. Enter a nonexistent keyword.
7. Confirm that the no-results message appears.
8. Clear the search.

### Final Checks

1. Open browser developer tools.
2. Check the Console while using each feature.
3. Confirm that there are no normal-use errors.
4. Check that Bootstrap and jQuery load successfully.
5. Repeat navigation and form tests on the published site.

## Deployment with GitHub Pages

1. Upload the project files to a GitHub repository.
2. Keep index.html in the repository root.
3. Open repository Settings → Pages.
4. Select deployment from the main branch and root folder.
5. Save the settings.
6. Open the generated website URL.
7. Test all five pages.
8. Add the published URL to this README and the assignment submission.

## Demonstration Limitations

All initial vacancies and companies are fictional educational data.

Custom vacancies, saved job identifiers and the selected theme are stored in this browser using localStorage.

Custom vacancies are not shared between browsers, devices or users.

Clearing site data removes locally saved information.

The employer email is validated but is not stored in the vacancy.

The contact form validates input but does not send or store messages.

There is no backend, account system or real job application service.

## Defence Checklist

Every team member should be able to:

- Explain the project data arrays.
- Locate two loop examples.
- Explain function parameters and return values.
- Demonstrate dynamic DOM creation and removal.
- Explain event handling and preventDefault.
- Explain the validation rules.
- Identify jQuery selectors, traversal methods and effects.
- Explain localStorage and its limitations.
- Demonstrate their actual contribution.
- Answer questions about any page or part of the code.
