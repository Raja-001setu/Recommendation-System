# AI Product Recommendation Demo

Small React app that shows a static list of products and lets the user
enter a preference (e.g. “phone under ₹40,000 for gaming”). The app
sends the query + product list to Google's Gemini API, which returns
the IDs of the best matching products. These are then highlighted in
the UI.

## Tech

- React (Create React App)
- Gemini API (HTTP fetch from frontend)

## How to run

1. Clone the repo
2. Create a `.env` file in the root:

   REACT_APP_GEMINI_API_KEY=your_key_here

3. Install dependencies:

   npm install

4. Start dev server:

   npm start
