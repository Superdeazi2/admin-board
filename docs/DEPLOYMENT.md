# Production demo deployment

Admin Board is prepared for a single-origin Render deployment:

- `/` serves the built React application from Fastify;
- `/api/*` serves the REST API;
- `/docs` serves Swagger/OpenAPI;
- `/health` is the deployment health check;
- PostgreSQL is a managed Render database.

## Recommended portfolio setup

`render.yaml` intentionally uses an always-on `starter` web service and `basic-256mb` PostgreSQL in Frankfurt. This avoids the cold-start behavior and 30-day database expiry of Render's free portfolio preview setup.

Create a new **Blueprint** in Render from the GitHub repository and apply `render.yaml`.

The Blueprint:

1. installs dependencies;
2. generates Prisma Client;
3. builds API and frontend;
4. runs Prisma migrations before deployment;
5. starts Fastify in production mode;
6. injects generated JWT secrets;
7. injects the managed PostgreSQL connection string;
8. waits for GitHub checks before auto-deploying later commits.

## Public demo account

```text
demo@adminboard.app
PortfolioDemo!2026
```

The password is intentionally public and is not an application secret.

When `DEMO_MODE=true`, a successful login with the demo account resets the dedicated demo database to its baseline state before issuing a session. Visitors can try ticket CRUD and user management, but the next demo login restores the portfolio dataset. Registration is disabled in this mode.

Local development continues to use the normal `.env` configuration and local seed accounts.

## After the first successful deploy

Verify:

```text
/
 /health
 /docs
 /api/auth/login
```

Then add the real Render URL to the top of `README.md` and to the GitHub repository Homepage field. Do not add a guessed URL before Render has created the service.
