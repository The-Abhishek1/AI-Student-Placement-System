import axios from 'axios';
import * as cheerio from 'cheerio';

export class JobScraper {
  private apiKeys: any;

  constructor() {
    this.apiKeys = {
      indeed: process.env.INDEED_API_KEY,
      linkedin: process.env.LINKEDIN_API_KEY
    };
  }

  async scrapeLinkedInJobs(keywords: string[], location: string) {
    try {
      // Using LinkedIn's public RSS feed (replace with official API in production)
      const jobs = [];
      
      for (const keyword of keywords) {
        const response = await axios.get(
          `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${keyword}&location=${location}&start=0`
        );
        
        const $ = cheerio.load(response.data);
        
        $('.job-search-card').each((i, element) => {
          const job = {
            title: $(element).find('.base-search-card__title').text().trim(),
            company: $(element).find('.base-search-card__subtitle').text().trim(),
            location: $(element).find('.job-search-card__location').text().trim(),
            url: $(element).find('.base-card__full-link').attr('href'),
            postedDate: $(element).find('.job-search-card__listdate').attr('datetime'),
            source: 'linkedin'
          };
          jobs.push(job);
        });
      }
      
      return jobs;
    } catch (error) {
      console.error('LinkedIn scraping error:', error);
      return [];
    }
  }

  async scrapeIndeedJobs(keywords: string[], location: string) {
    try {
      const jobs = [];
      
      for (const keyword of keywords) {
        const response = await axios.get(
          `https://www.indeed.com/jobs?q=${keyword}&l=${location}`
        );
        
        const $ = cheerio.load(response.data);
        
        $('.job_seen_beacon').each((i, element) => {
          const job = {
            title: $(element).find('.jobTitle').text().trim(),
            company: $(element).find('.companyName').text().trim(),
            location: $(element).find('.companyLocation').text().trim(),
            salary: $(element).find('.salary-snippet').text().trim(),
            url: 'https://www.indeed.com' + $(element).find('.jcs-JobTitle').attr('href'),
            source: 'indeed'
          };
          jobs.push(job);
        });
      }
      
      return jobs;
    } catch (error) {
      console.error('Indeed scraping error:', error);
      return [];
    }
  }

  async fetchRealTimeJobs(keywords: string[], location: string) {
    const [linkedInJobs, indeedJobs] = await Promise.all([
      this.scrapeLinkedInJobs(keywords, location),
      this.scrapeIndeedJobs(keywords, location)
    ]);

    return {
      linkedin: linkedInJobs,
      indeed: indeedJobs,
      total: linkedInJobs.length + indeedJobs.length,
      timestamp: new Date()
    };
  }
}