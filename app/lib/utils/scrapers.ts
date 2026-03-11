import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

interface ScrapedJob {
  id?: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  description?: string;
  url: string;
  postedDate?: string;
  source: 'linkedin' | 'indeed' | 'glassdoor' | 'manual';
  skills?: string[];
}

export class JobScraper {
  private apiKeys: any;
  private axiosInstance;

  constructor() {
    this.apiKeys = {
      indeed: process.env.INDEED_API_KEY,
      linkedin: process.env.LINKEDIN_API_KEY,
      glassdoor: process.env.GLASSDOOR_API_KEY
    };

    // Create axios instance with timeout and retry config
    this.axiosInstance = axios.create({
      timeout: 10000,
      httpsAgent: new https.Agent({ 
        rejectUnauthorized: false // For development only
      }),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });
  }

  async scrapeLinkedInJobs(keywords: string[], location: string): Promise<ScrapedJob[]> {
    try {
      const jobs: ScrapedJob[] = [];
      
      for (const keyword of keywords) {
        try {
          // Note: LinkedIn has strict anti-scraping measures
          // In production, use their official API instead
          const encodedKeyword = encodeURIComponent(keyword);
          const encodedLocation = encodeURIComponent(location);
          
          const response = await this.axiosInstance.get(
            `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodedKeyword}&location=${encodedLocation}&start=0`,
            {
              headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
              }
            }
          );
          
          const $ = cheerio.load(response.data);
          
          $('.job-search-card').each((i, element) => {
            if (i < 10) { // Limit to 10 jobs per keyword
              const title = $(element).find('.base-search-card__title').text().trim();
              const company = $(element).find('.base-search-card__subtitle').text().trim();
              const location = $(element).find('.job-search-card__location').text().trim();
              const url = $(element).find('.base-card__full-link').attr('href') || '';
              const postedDate = $(element).find('.job-search-card__listdate').attr('datetime');
              
              if (title && company) {
                jobs.push({
                  title,
                  company,
                  location: location || 'Remote',
                  url,
                  postedDate: postedDate || new Date().toISOString(),
                  source: 'linkedin',
                  skills: this.extractSkillsFromTitle(title)
                });
              }
            }
          });

          // Add delay between requests to avoid rate limiting
          await this.delay(2000);
          
        } catch (keywordError) {
          console.error(`Error scraping LinkedIn for keyword ${keyword}:`, keywordError);
          continue; // Continue with next keyword
        }
      }
      
      return jobs;
    } catch (error) {
      console.error('LinkedIn scraping error:', error);
      return [];
    }
  }

  async scrapeIndeedJobs(keywords: string[], location: string): Promise<ScrapedJob[]> {
    try {
      const jobs: ScrapedJob[] = [];
      
      for (const keyword of keywords) {
        try {
          const encodedKeyword = encodeURIComponent(keyword);
          const encodedLocation = encodeURIComponent(location);
          
          const response = await this.axiosInstance.get(
            `https://www.indeed.com/jobs?q=${encodedKeyword}&l=${encodedLocation}&start=0`,
            {
              headers: {
                'Accept': 'text/html',
                'Cache-Control': 'no-cache'
              }
            }
          );
          
          const $ = cheerio.load(response.data);
          
          $('.job_seen_beacon').each((i, element) => {
            if (i < 10) { // Limit to 10 jobs per keyword
              const title = $(element).find('.jobTitle').text().trim();
              const company = $(element).find('.companyName').text().trim();
              const location = $(element).find('.companyLocation').text().trim();
              const salary = $(element).find('.salary-snippet').text().trim();
              const url = 'https://www.indeed.com' + ($(element).find('.jcs-JobTitle').attr('href') || '');
              
              if (title && company) {
                jobs.push({
                  title,
                  company,
                  location: location || 'Remote',
                  salary,
                  url,
                  source: 'indeed',
                  postedDate: new Date().toISOString(),
                  skills: this.extractSkillsFromTitle(title)
                });
              }
            }
          });

          // Add delay between requests
          await this.delay(1500);
          
        } catch (keywordError) {
          console.error(`Error scraping Indeed for keyword ${keyword}:`, keywordError);
          continue;
        }
      }
      
      return jobs;
    } catch (error) {
      console.error('Indeed scraping error:', error);
      return [];
    }
  }

  async scrapeGlassdoorJobs(keywords: string[], location: string): Promise<ScrapedJob[]> {
    try {
      const jobs: ScrapedJob[] = [];
      
      for (const keyword of keywords) {
        try {
          const encodedKeyword = encodeURIComponent(keyword);
          const encodedLocation = encodeURIComponent(location);
          
          const response = await this.axiosInstance.get(
            `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodedKeyword}&locT=C&locId=&locKeyword=${encodedLocation}`,
            {
              headers: {
                'Accept': 'text/html',
                'Cache-Control': 'no-cache'
              }
            }
          );
          
          const $ = cheerio.load(response.data);
          
          $('.react-job-listing').each((i, element) => {
            if (i < 10) {
              const title = $(element).find('.jobTitle').text().trim();
              const company = $(element).find('.employerName').text().trim();
              const location = $(element).find('.location').text().trim();
              const url = 'https://www.glassdoor.com' + ($(element).find('.jobLink').attr('href') || '');
              
              if (title && company) {
                jobs.push({
                  title,
                  company,
                  location: location || 'Remote',
                  url,
                  source: 'glassdoor',
                  postedDate: new Date().toISOString(),
                  skills: this.extractSkillsFromTitle(title)
                });
              }
            }
          });

          await this.delay(2000);
          
        } catch (keywordError) {
          console.error(`Error scraping Glassdoor for keyword ${keyword}:`, keywordError);
          continue;
        }
      }
      
      return jobs;
    } catch (error) {
      console.error('Glassdoor scraping error:', error);
      return [];
    }
  }

  async fetchRealTimeJobs(keywords: string[], location: string): Promise<{
    linkedin: ScrapedJob[];
    indeed: ScrapedJob[];
    glassdoor: ScrapedJob[];
    total: number;
    timestamp: Date;
  }> {
    try {
      // Run all scrapers concurrently
      const [linkedInJobs, indeedJobs, glassdoorJobs] = await Promise.allSettled([
        this.scrapeLinkedInJobs(keywords, location),
        this.scrapeIndeedJobs(keywords, location),
        this.scrapeGlassdoorJobs(keywords, location)
      ]);

      const result = {
        linkedin: linkedInJobs.status === 'fulfilled' ? linkedInJobs.value : [],
        indeed: indeedJobs.status === 'fulfilled' ? indeedJobs.value : [],
        glassdoor: glassdoorJobs.status === 'fulfilled' ? glassdoorJobs.value : [],
        total: 0,
        timestamp: new Date()
      };

      result.total = result.linkedin.length + result.indeed.length + result.glassdoor.length;

      console.log(`✅ Scraped ${result.total} jobs from all sources`);
      return result;
    } catch (error) {
      console.error('Error in fetchRealTimeJobs:', error);
      return {
        linkedin: [],
        indeed: [],
        glassdoor: [],
        total: 0,
        timestamp: new Date()
      };
    }
  }

  // Helper method to extract skills from job title
  private extractSkillsFromTitle(title: string): string[] {
    const commonSkills = [
      'Python', 'Java', 'JavaScript', 'React', 'Angular', 'Vue', 'Node.js',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'SQL', 'NoSQL',
      'Machine Learning', 'AI', 'Data Science', 'DevOps', 'Cloud',
      'C++', 'C#', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Go', 'Rust',
      'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Spring', 'Django',
      'Flask', 'Express', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis'
    ];

    return commonSkills.filter(skill => 
      title.toLowerCase().includes(skill.toLowerCase())
    );
  }

  // Helper method to add delay between requests
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Method to format job data for database storage
  formatJobForDB(job: ScrapedJob): any {
    return {
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description || '',
      requirements: job.skills || [],
      skills: job.skills || [],
      source: job.source,
      url: job.url,
      postedDate: job.postedDate ? new Date(job.postedDate) : new Date(),
      active: true,
      salary: job.salary ? this.parseSalary(job.salary) : { min: 0, max: 0, currency: 'USD' }
    };
  }

  // Helper to parse salary strings
  private parseSalary(salaryStr: string): { min: number; max: number; currency: string } {
    const defaultSalary = { min: 0, max: 0, currency: 'USD' };
    
    if (!salaryStr) return defaultSalary;

    // Extract numbers from salary string
    const numbers = salaryStr.match(/\d+(?:,\d+)*(?:\.\d+)?/g);
    if (!numbers) return defaultSalary;

    // Determine currency
    let currency = 'USD';
    if (salaryStr.includes('£')) currency = 'GBP';
    if (salaryStr.includes('€')) currency = 'EUR';
    if (salaryStr.includes('₹')) currency = 'INR';

    if (numbers.length === 1) {
      return {
        min: parseInt(numbers[0].replace(/,/g, '')),
        max: parseInt(numbers[0].replace(/,/g, '')),
        currency
      };
    } else if (numbers.length >= 2) {
      return {
        min: parseInt(numbers[0].replace(/,/g, '')),
        max: parseInt(numbers[1].replace(/,/g, '')),
        currency
      };
    }

    return defaultSalary;
  }
}

// Export a singleton instance
export const jobScraper = new JobScraper();