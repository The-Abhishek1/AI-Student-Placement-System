import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export class AIService {
  private model = genAI.getGenerativeModel({ model: "gemini-pro" });

  async analyzeStudentProfile(studentData: any) {
    const prompt = `
      Analyze this student profile for job placement:
      Name: ${studentData.name}
      Department: ${studentData.department}
      Skills: ${JSON.stringify(studentData.skills)}
      Experience: ${JSON.stringify(studentData.experience)}
      
      Provide:
      1. Top 5 suitable job roles
      2. Skill gap analysis
      3. Recommended learning path
      4. Estimated placement timeline
      5. Salary range prediction
      
      Format as JSON.
    `;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  }

  async matchJobWithStudent(student: any, job: any) {
    const prompt = `
      Calculate job match score between:
      
      Student: ${JSON.stringify(student)}
      Job: ${JSON.stringify(job)}
      
      Provide:
      1. Overall match percentage (0-100)
      2. Breakdown by skills, experience, education, location
      3. Specific recommendations for improvement
      4. Interview preparation tips
      
      Return as JSON with scores and actionable insights.
    `;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  }

  async generateLearningPath(skillGaps: any[]) {
    const prompt = `
      Create a personalized learning path for these skill gaps:
      ${JSON.stringify(skillGaps)}
      
      Include:
      1. Recommended courses with URLs (Coursera, Udemy, edX)
      2. Project ideas for hands-on practice
      3. Certification recommendations
      4. Estimated time to complete each
      5. Priority order
      
      Return as JSON with actionable resources.
    `;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  }

  async analyzeMarketTrends(jobTitles: string[]) {
    const prompt = `
      Analyze current job market trends for:
      ${jobTitles.join(', ')}
      
      Provide:
      1. Demand trends (increasing/decreasing)
      2. Salary ranges by location
      3. Top hiring companies
      4. Required skills evolution
      5. Future outlook for 2024-2025
      
      Return as JSON with data-backed insights.
    `;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  }
}