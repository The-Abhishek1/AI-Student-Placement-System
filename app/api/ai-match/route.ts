import { NextResponse } from 'next/server';
import { AIService } from '@/app/lib/ai/gemini';
import connectDB from '@/app/lib/db/mongodb';
import {Student} from '@/app/lib/db/models/Student';
import {Job} from '@/app/lib/db/models/Job';
import {Match} from '@/app/lib/db/models/Match';

const aiService = new AIService();

export async function POST(request: Request) {
    try {
        await connectDB();
        const { studentId } = await request.json();

        if (!studentId) {
            return NextResponse.json(
                { error: 'Student ID is required' },
                { status: 400 }
            );
        }

        // Get student profile
        const student = await Student.findById(studentId);
        if (!student) {
            return NextResponse.json(
                { error: 'Student not found' },
                { status: 404 }
            );
        }

        // Get matching jobs
        const jobs = await Job.find({ active: true }).limit(50).lean();
        
        if (!jobs.length) {
            return NextResponse.json(
                { error: 'No jobs available for matching' },
                { status: 404 }
            );
        }

        // AI-powered matching
        const matches = [];
        for (const job of jobs) {
            try {
                const matchResult = await aiService.matchJobWithStudent(student, job);
                
                // Save match to database
                const match = await Match.create({
                    studentId: student._id,
                    jobId: job._id,
                    score: matchResult.overall || 0,
                    breakdown: matchResult.breakdown || {
                        skills: 0,
                        experience: 0,
                        education: 0,
                        location: 0,
                        salary: 0
                    },
                    recommendations: matchResult.recommendations || [],
                    status: 'pending'
                });
                
                matches.push({
                    job,
                    matchResult,
                    matchId: match._id
                });
            } catch (matchError) {
                console.error(`Error matching job ${job._id}:`, matchError);
                // Continue with next job even if one fails
                continue;
            }
        }

        // Sort by match score
        matches.sort((a, b) => (b.matchResult?.overall || 0) - (a.matchResult?.overall || 0));

        // Update student's match score
        if (matches.length > 0) {
            student.matchScore = matches[0].matchResult?.overall || 0;
            await student.save();
        }

        return NextResponse.json({
            success: true,
            matches: matches.slice(0, 10), // Top 10 matches
            totalMatches: matches.length,
            studentName: student.name
        });
    } catch (error) {
        console.error('AI Match error:', error);
        return NextResponse.json(
            { error: 'Failed to process match' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const studentId = searchParams.get('studentId');
        const status = searchParams.get('status');

        if (!studentId) {
            return NextResponse.json(
                { error: 'Student ID required' },
                { status: 400 }
            );
        }

        // Build query
        const query: any = { studentId };
        if (status) query.status = status;

        // Get existing matches with AI analysis
        const matches = await Match.find(query)
            .populate('studentId')
            .populate('jobId')
            .sort({ score: -1, createdAt: -1 })
            .lean();

        return NextResponse.json({ 
            success: true, 
            matches,
            count: matches.length
        });
    } catch (error) {
        console.error('Fetch matches error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch matches' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const matchId = searchParams.get('id');
        const updates = await request.json();

        if (!matchId) {
            return NextResponse.json(
                { error: 'Match ID required' },
                { status: 400 }
            );
        }

        const match = await Match.findByIdAndUpdate(
            matchId,
            { ...updates, updatedAt: new Date() },
            { new: true }
        );

        if (!match) {
            return NextResponse.json(
                { error: 'Match not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            match,
            message: 'Match updated successfully'
        });
    } catch (error) {
        console.error('Match update error:', error);
        return NextResponse.json(
            { error: 'Failed to update match' },
            { status: 500 }
        );
    }
}