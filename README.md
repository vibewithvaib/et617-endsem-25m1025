# YourRatio

**YourRatio** is a local, browser-based interactive learning application for Ratio and Proportion using everyday recipe and map examples.

## Features

- **5 Guided Chapters**:
  1. Understanding Ratios
  2. Equivalent Ratios
  3. Ratios in Recipes
  4. Ratios on Maps
  5. Practice and Challenge
- **Structured 6-Step Chapter Flow**: Introduction, Worked Examples, Explore & Interact, Guided Practice, Independent Practice, and Mastery Check.
- **Local Question Generation & Validation**: Generates multiple-choice, fill-in-the-blank, numerical, and short-answer questions locally with mathematical validation and prepared fallbacks. No external AI service or API keys are required.
- **Rule-Based Mastery & Unlocking**: Passing at least 4 out of 5 mastery check questions unlocks the next chapter; scores below 4 provide targeted concept review, examples, and retries.
- **10-Minute Focus Sessions & Local Persistence**: Saves progress automatically in browser `localStorage` so learners can pause and resume from the exact step where they stopped.
- **Interaction Logs**: Export recorded learning interactions as JSON using **Collect Interaction Logs**.

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the local application on port `3000`:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser.

## Running Unit Tests

```bash
npx --yes tsx --test src/its/learning.test.ts
```
