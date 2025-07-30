/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Define scrapers with their configurations - all using simple scraper
const SCRAPERS = [
    {
        name: 'Ealing',
        script: 'python3 scraping/framework/simple_scraper.py ealing_london',
        council_id: 'ealing_london',
        description: 'Ealing Council Planning Applications'
    },
    {
        name: 'Windsor and Maidenhead',
        script: 'python3 scraping/framework/simple_scraper.py windsor_maidenhead',
        council_id: 'windsor_maidenhead',
        description: 'Royal Borough of Windsor and Maidenhead Planning Applications'
    },
    {
        name: 'Elmbridge',
        script: 'python3 scraping/framework/simple_scraper.py elmbridge',
        council_id: 'elmbridge',
        description: 'Elmbridge Borough Council Planning Applications'
    },
    {
        name: 'Richmond',
        script: 'python3 scraping/framework/simple_scraper.py richmond',
        council_id: 'richmond',
        description: 'London Borough of Richmond upon Thames Planning Applications'
    },
    {
        name: 'Surrey',
        script: 'python3 scraping/framework/simple_scraper.py surrey',
        council_id: 'surrey',
        description: 'Surrey County Council Planning Applications'
    },
    {
        name: 'Surrey Heath',
        script: 'python3 scraping/framework/simple_scraper.py surrey_heath',
        council_id: 'surrey_heath',
        description: 'Surrey Heath Borough Council Planning Applications'
    },
    {
        name: 'Hertfordshire',
        script: 'python3 scraping/framework/simple_scraper.py hertfordshire',
        council_id: 'hertfordshire',
        description: 'Hertfordshire County Council Planning Applications'
    },
    {
        name: 'Buckinghamshire',
        script: 'python3 scraping/framework/simple_scraper.py buckinghamshire',
        council_id: 'buckinghamshire',
        description: 'Buckinghamshire Council Planning Applications'
    }
];

async function runScraper(scraper: any) {
    const startTime = Date.now();
    console.log(`🚀 Starting ${scraper.name} scraper...`);

    try {
        const { stdout, stderr } = await execAsync(scraper.script, {
            timeout: 120000, // 2 minutes timeout (reduced further)
            env: {
                ...process.env,
                PYTHONPATH: process.cwd()
            }
        });

        const duration = Date.now() - startTime;

        if (stderr) {
            console.warn(`⚠️  ${scraper.name} warnings:`, stderr);
        }

        console.log(`✅ ${scraper.name} completed successfully in ${duration}ms`);
        console.log(`📊 ${scraper.name} output:`, stdout);

        return {
            success: true,
            name: scraper.name,
            duration,
            output: stdout,
            warnings: stderr
        };

    } catch (error: any) {
        const duration = Date.now() - startTime;
        console.error(`❌ ${scraper.name} failed after ${duration}ms:`, error.message);

        return {
            success: false,
            name: scraper.name,
            duration,
            error: error.message,
            output: error.stdout || '',
            warnings: error.stderr || ''
        };
    }
}

async function updateScraperStatus(council_id: string, success: boolean, details: any) {
    try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const data = {
            council_id,
            user_id: process.env.SCRAPER_USER_ID,
            last_run: new Date().toISOString(),
            success,
            details: JSON.stringify(details),
            updated_at: new Date().toISOString()
        };

        await supabase
            .from('scraper_metadata')
            .upsert(data, { onConflict: 'user_id,council_id' });

    } catch (error) {
        console.error(`Failed to update scraper status for ${council_id}:`, error);
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
    console.log('🕐 Scraping cron job started at:', new Date().toISOString());

    const results = [];
    const startTime = Date.now();

    try {
        // Run all scrapers sequentially
        for (const scraper of SCRAPERS) {
            const result = await runScraper(scraper);
            results.push(result);

            // Update status in database
            await updateScraperStatus(scraper.council_id, result.success, result);

            // Add delay between scrapers to avoid overwhelming servers
            if (scraper !== SCRAPERS[SCRAPERS.length - 1]) {
                console.log('⏳ Waiting 3 seconds before next scraper...');
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }

        const totalDuration = Date.now() - startTime;
        const successfulScrapers = results.filter(r => r.success).length;
        const failedScrapers = results.filter(r => !r.success).length;

        console.log('🎉 All scrapers completed!');
        console.log(`📊 Results: ${successfulScrapers} successful, ${failedScrapers} failed`);
        console.log(`⏱️  Total duration: ${totalDuration}ms`);

        return NextResponse.json({
            success: true,
            message: `Scraping completed: ${successfulScrapers} successful, ${failedScrapers} failed`,
            totalDuration,
            results
        });

    } catch (error: any) {
        console.error('💥 Fatal error in scraping cron job:', error);

        return NextResponse.json({
            success: false,
            error: error.message,
            results
        }, { status: 500 });
    }
} 