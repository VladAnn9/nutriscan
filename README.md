# NutriScan - AI Plate Calorie Counter

This is a Next.js application built with Genkit, ShadCN UI, and Tailwind CSS. It uses AI to analyze meal images and track nutritional intake.

## Getting Started Locally

Follow these steps to get the project running on your machine:

### 1. Prerequisites
- Node.js (v18 or later)
- npm or yarn

### 2. Installation
Extract the downloaded ZIP file, navigate to the project directory in your terminal, and run:
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory (if it's not already there) and add your Google AI API key:
```env
GOOGLE_GENAI_API_KEY=your_api_key_here
```
You can obtain a key from the [Google AI Studio](https://aistudio.google.com/).

### 4. Running the App
Start the development server:
```bash
npm run dev
```
Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

### 5. AI Development (Genkit)
To explore or debug the Genkit flows:
```bash
npm run genkit:dev
```

## Features
- **AI Meal Scanner:** Upload a photo of your plate to identify food items and nutrients.
- **Daily Dashboard:** Track calories, protein, carbs, and fat against daily goals.
- **PWA Support:** Install the app to your home screen for a native experience.
- **Responsive Design:** Optimized for both mobile and desktop use.
