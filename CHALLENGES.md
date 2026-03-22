# Challenges Faced

1. The workbook contains sector rows and holding rows in the same sheet, so the parser has to detect sector labels and apply them to the rows that follow.
2. Yahoo Finance returns usable market data for CMP, but Google Finance does not provide a stable public API. To keep the dashboard working, workbook values are used as fallback for P/E Ratio and Latest Earnings.
3. Refresh was implemented as a stateless API flow so the dashboard does not depend on server memory between requests.
