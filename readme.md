What works now
You can filter using either normal query params or a single natural-language q text.

Supported patterns from your examples:

Used Hyundai Santro in Kolkata
Used Cars in Kolkata in 4-5 Lakh
Used Hyundai Cars in Kolkata
Used Cars from 2017 in Kolkata
Used Manual Cars in Kolkata
Added backend capabilities
q parsing for:

city (in Kolkata)
budget in lakh (4-5 Lakh)
year (from 2017)
transmission keywords (manual, automatic)
brand/model detection from existing DB values
Added budget aliases:

price_lakh_min
price_lakh_max
budget_lakh (example: 4-5 lakh)
Added year alias:

year_from
Improved matching:

case-insensitive brand/model/city matching in filters.
Example calls
/cars?q=Used Hyundai Santro in Kolkata
/cars?q=Used Cars in Kolkata in 4-5 Lakh
/cars?brand=Hyundai&city=Kolkata
/cars?year_from=2017&city=Kolkata
/cars?transmission=manual&city=Kolkata
/cars?city=Kolkata&price_lakh_min=4&price_lakh_max=5
Validation done: controller loads successfully with Node (no syntax errors).

Vercel deployment
1. Ensure `vercel.json` exists in project root and routes to `index.js`.
2. Set these environment variables in Vercel Project Settings:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `GMAIL_USER`
   - `GMAIL_PASS`
3. Deploy the `Singh_backend` folder to Vercel.
4. Test health endpoint after deploy:
   - `GET /api/healthz`

Expected health response:
{
  "status": "ok",
  "service": "singh_backend",
  "timestamp": "2026-01-01T00:00:00.000Z"
}
