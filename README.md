# PrepOrbit-AI

AI-powered interview prep app (MERN + Google Gemini). Upload your resume, add a job description, and get a personalized interview report.

**Live:** https://prep-orbit-ai.vercel.app

## Features
- Resume-to-job match score and skill-gap analysis
- Technical and behavioral questions with answer guidance
- Day-wise preparation roadmap
- ATS-friendly tailored resume PDF
- JWT authentication and saved report history

## Tech Stack
React, SCSS, Node.js, Express, MongoDB, Gemini API, JWT, bcrypt, Multer, pdf-parse, Zod

## How It Works
1. Resume PDF is parsed to text.
2. Resume is split into chunks and embedded (`gemini-embedding-001`); the top 6 chunks most similar to the job description are retrieved by cosine similarity (falls back to the full resume on error).
3. Retrieved chunks + job description + self-description go to Gemini, which returns schema-enforced JSON.
4. The report is saved to MongoDB.

