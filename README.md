# URL Extension Service

Extends a URL to a specified length. Extended URLs resolve to their destination indefinitely.

Runs at [urls.dwainosaur.com](https://urls.dwainosaur.com) on Cloudflare Workers. The destination is encoded inside the extended URL, so there is no database and nothing expires.

## Development

```
pnpm install
pnpm dev
```

`pnpm test` runs the unit and Worker tests, `pnpm e2e` runs the Playwright suite against a local `wrangler dev`, and `pnpm check` runs Biome.

## API

```
GET /api/v1/extend?url=https://example.com&style=enterprise&length=1000
```

Returns JSON with the extended URL. `GET /api/v1/styles` lists the available styles. Full documentation is served at `/docs`.
