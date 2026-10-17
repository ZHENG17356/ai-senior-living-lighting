# LUMA development workflow

- Use `luma-development` for ongoing LUMA changes.
- Commit and push changes to `luma-development`, then use the corresponding Vercel Preview Deployment for browser verification.
- Do not merge into or push to `main`, promote a Preview to Production, or run a production deployment unless the user explicitly authorizes that action.
- Preserve the existing LUMA content, temporary image source records, and the clear labels distinguishing schematic plans / reference photos from actual facility documentation.
- Keep local `.openai/`, `.vercel/`, and `dist/` artifacts out of GitHub commits for this Vercel project.
- Use the repository-root `index.html`, `css/`, `js/`, and `assets/` as the static site's source. No framework rebuild is required.
- Verify desktop and mobile layouts, image loading, day/night floor-plan controls, photo comparison tabs, and all three reactive lighting scenes on the deployed preview.
