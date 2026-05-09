# **App Name**: NutriSnap

## Core Features:

- Dashboard Display: Clean dashboard showing today's cumulative calorie and macronutrient intake.
- Image Upload: Opens the device's camera or file uploader for the user to submit a photo of their food.
- AI Analysis: The uploaded image is sent to the Gemini AI for processing. The tool constructs a prompt to ask for a specific JSON output with the food items' nutritional information.
- Results Display: Displays a structured list of identified food items with their nutritional information in a clear format.
- Review and Adjust: Allows the user to correct food items, adjust quantity, delete items, and manually add items.
- Confirmation: Adds the total calories and macros for that meal to their daily log.
- History: Displays a chronological log of all meals from the current day, with a separate tab to view past days.

## Style Guidelines:

- Primary background color: White (#FFFFFF) to provide a clean and open feel.
- Text color: Dark Gray (#2d3748) to ensure high readability and contrast.
- Accent color: Vibrant Green (#48BB78) for buttons and CTAs to draw attention.
- Body and headline font: 'Inter' (sans-serif) ensuring high readability and a modern feel.
- Mobile-first design using cards, ample whitespace, and clear visual hierarchy.
- Implement micro-animations using Framer Motion for progress bars, fading in cards, and modal pop-ups.