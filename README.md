# Portfolio Dashboard Assignment

This project is a workbook-driven stock portfolio dashboard built for the assignment.

## Stack
- Next.js
- TypeScript
- Tailwind CSS
- xlsx for workbook parsing
- zod for row validation
- Vitest for unit tests

## Features
- Upload workbook
- Parse holdings from the workbook
- Fetch CMP from Yahoo Finance
- Fetch P/E Ratio and Latest Earnings through a Google Finance path
- Fall back to workbook values when provider data is unavailable
- Calculate investment, present value, gain/loss, and portfolio percentage
- Group holdings by sector
- Refresh market values every 15 seconds

## Run locally
```bash
npm install
npm run dev
```

## Run tests
```bash
npm run test
```

## Notes
- The Google Finance path is implemented through a backend request plus workbook fallback because Google Finance does not provide a stable public API.
