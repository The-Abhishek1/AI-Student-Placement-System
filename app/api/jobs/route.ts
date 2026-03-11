import { NextResponse } from 'next/server';
import { JobScraper } from '@/app/lib/utils/scrapers';
import connectDB, { Job } from '@/app/lib/db/mongodb';

const scraper = new JobScraper();

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const keywords = searchParams.get('keywords')?.split(',') || ['software engineer', 'data scientist'];
    const location = searchParams.get('location') || 'United States';
    const source = searchParams.get('source') || 'all';

    let jobs = [];

    // Fetch from database first
    const dbJobs = await Job.find({
      skills: { $in: keywords },
      active: true
    }).limit(50);

    if (dbJobs.length > 20) {
      jobs = dbJobs;
    } else {
      // Scrape real-time jobs if not enough in DB
      const scrapedJobs = await scraper.fetchRealTimeJobs(keywords, location);
      
      // Save scraped jobs to database
      for (const job of [...scrapedJobs.linkedin, ...scrapedJobs.indeed]) {
        await Job.findOneAndUpdate(
          { url: job.url },
          { ...job, active: true },
          { upsert: true, new: true }
        );
      }
      
      jobs = await Job.find({
        skills: { $in: keywords },
        active: true
      }).limit(100);
    }

    return NextResponse.json({
      success: true,
      jobs,
      count: jobs.length,
      source: jobs === dbJobs ? 'database' : 'scraped'
    });
  } catch (error) {
    console.error('Job fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const jobData = await request.json();
    
    const job = await Job.create(jobData);
    
    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error('Job creation error:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}