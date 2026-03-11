import { NextResponse } from 'next/server';
import { JobScraper } from '@/app/lib/utils/scrapers';
import connectDB from '@/app/lib/db/mongodb';
import {Job} from '@/app/lib/db/models/Job';

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
            $or: [
                { title: { $regex: keywords.join('|'), $options: 'i' } },
                { skills: { $in: keywords } }
            ],
            active: true
        })
        .sort({ postedDate: -1 })
        .limit(50)
        .lean();

        if (dbJobs.length > 20) {
            jobs = dbJobs;
        } else {
            try {
                // Scrape real-time jobs if not enough in DB
                const scrapedJobs = await scraper.fetchRealTimeJobs(keywords, location);
                
                // Save scraped jobs to database
                for (const job of [...(scrapedJobs.linkedin || []), ...(scrapedJobs.indeed || [])]) {
                    await Job.findOneAndUpdate(
                        { url: job.url },
                        { 
                            ...job, 
                            active: true,
                            postedDate: new Date(job.postedDate || Date.now())
                        },
                        { upsert: true, new: true }
                    );
                }
                
                jobs = await Job.find({
                    $or: [
                        { title: { $regex: keywords.join('|'), $options: 'i' } },
                        { skills: { $in: keywords } }
                    ],
                    active: true
                })
                .sort({ postedDate: -1 })
                .limit(100)
                .lean();
            } catch (scrapeError) {
                console.error('Scraping error:', scrapeError);
                // Return database results even if scraping fails
                jobs = dbJobs;
            }
        }

        return NextResponse.json({
            success: true,
            jobs,
            count: jobs.length,
            source: jobs === dbJobs ? 'database' : 'mixed'
        });
    } catch (error) {
        console.error('Job fetch error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch jobs' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();
        const jobData = await request.json();
        
        // Validate required fields
        if (!jobData.title || !jobData.company || !jobData.description) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }
        
        const job = await Job.create({
            ...jobData,
            postedDate: new Date(),
            active: true
        });
        
        return NextResponse.json({ 
            success: true, 
            job,
            message: 'Job created successfully'
        });
    } catch (error) {
        console.error('Job creation error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create job' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const updates = await request.json();

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Job ID required' },
                { status: 400 }
            );
        }

        const job = await Job.findByIdAndUpdate(
            id,
            { ...updates, updatedAt: new Date() },
            { new: true }
        );

        if (!job) {
            return NextResponse.json(
                { success: false, error: 'Job not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            job,
            message: 'Job updated successfully'
        });
    } catch (error) {
        console.error('Job update error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update job' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Job ID required' },
                { status: 400 }
            );
        }

        const job = await Job.findByIdAndDelete(id);

        if (!job) {
            return NextResponse.json(
                { success: false, error: 'Job not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Job deleted successfully'
        });
    } catch (error) {
        console.error('Job deletion error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete job' },
            { status: 500 }
        );
    }
}