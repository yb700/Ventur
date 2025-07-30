/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Free geocoding service (Nominatim from OpenStreetMap)
const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
        // Add UK to the address for better geocoding results
        const searchQuery = `${address}, UK`;
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=gb`
        );

        if (!response.ok) {
            throw new Error('Geocoding request failed');
        }

        const data = await response.json();

        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
        }

        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
};

// London Boroughs with their colors
const LONDON_BOROUGHS = {
    'barking_and_dagenham': { name: 'Barking and Dagenham', color: '#FF6B6B' },
    'barnet': { name: 'Barnet', color: '#4ECDC4' },
    'bexley': { name: 'Bexley', color: '#45B7D1' },
    'brent': { name: 'Brent', color: '#96CEB4' },
    'bromley': { name: 'Bromley', color: '#FFEAA7' },
    'camden': { name: 'Camden', color: '#DDA0DD' },
    'croydon': { name: 'Croydon', color: '#98D8C8' },
    'ealing': { name: 'Ealing', color: '#F7DC6F' },
    'enfield': { name: 'Enfield', color: '#BB8FCE' },
    'greenwich': { name: 'Greenwich', color: '#85C1E9' },
    'hackney': { name: 'Hackney', color: '#F8C471' },
    'hammersmith_and_fulham': { name: 'Hammersmith and Fulham', color: '#82E0AA' },
    'haringey': { name: 'Haringey', color: '#F1948A' },
    'harrow': { name: 'Harrow', color: '#85C1E9' },
    'havering': { name: 'Havering', color: '#D7BDE2' },
    'hillingdon': { name: 'Hillingdon', color: '#F9E79F' },
    'hounslow': { name: 'Hounslow', color: '#D5A6BD' },
    'islington': { name: 'Islington', color: '#A9CCE3' },
    'kensington_and_chelsea': { name: 'Kensington and Chelsea', color: '#FAD7A0' },
    'kingston_upon_thames': { name: 'Kingston upon Thames', color: '#ABEBC6' },
    'lambeth': { name: 'Lambeth', color: '#F8C471' },
    'lewisham': { name: 'Lewisham', color: '#85C1E9' },
    'merton': { name: 'Merton', color: '#D7BDE2' },
    'newham': { name: 'Newham', color: '#F9E79F' },
    'redbridge': { name: 'Redbridge', color: '#D5A6BD' },
    'richmond_upon_thames': { name: 'Richmond upon Thames', color: '#A9CCE3' },
    'southwark': { name: 'Southwark', color: '#FAD7A0' },
    'sutton': { name: 'Sutton', color: '#ABEBC6' },
    'tower_hamlets': { name: 'Tower Hamlets', color: '#F8C471' },
    'waltham_forest': { name: 'Waltham Forest', color: '#85C1E9' },
    'wandsworth': { name: 'Wandsworth', color: '#D7BDE2' },
    'westminster': { name: 'Westminster', color: '#F9E79F' }
};

export async function GET(request: Request) {
    try {
        // Verify this is a Vercel cron job request
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const supabase = await createClient();

        // Get all applications without coordinates
        const { data: applications, error: fetchError } = await supabase
            .from('applications')
            .select('id, address, council_id')
            .or('latitude.is.null,longitude.is.null')
            .limit(100); // Process in batches

        if (fetchError) {
            console.error('Error fetching applications:', fetchError);
            return new NextResponse(JSON.stringify({ error: 'Failed to fetch applications' }), { status: 500 });
        }

        if (!applications || applications.length === 0) {
            return new NextResponse(JSON.stringify({ message: 'No applications need geocoding' }), { status: 200 });
        }

        let successCount = 0;
        let failCount = 0;

        // Process applications in batches to respect rate limits
        const batchSize = 3;
        for (let i = 0; i < applications.length; i += batchSize) {
            const batch = applications.slice(i, i + batchSize);

            const batchPromises = batch.map(async (app) => {
                if (!app.address) {
                    return { id: app.id, success: false };
                }

                const coords = await geocodeAddress(app.address);

                if (coords) {
                    // Update the application with coordinates
                    const { error: updateError } = await supabase
                        .from('applications')
                        .update({
                            latitude: coords.lat,
                            longitude: coords.lng
                        })
                        .eq('id', app.id);

                    if (updateError) {
                        console.error(`Error updating application ${app.id}:`, updateError);
                        return { id: app.id, success: false };
                    }

                    return { id: app.id, success: true };
                } else {
                    return { id: app.id, success: false };
                }
            });

            const batchResults = await Promise.all(batchPromises);

            batchResults.forEach(result => {
                if (result.success) {
                    successCount++;
                } else {
                    failCount++;
                }
            });

            // Add delay between batches to respect rate limits
            if (i + batchSize < applications.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        console.log(`Geocoding completed: ${successCount} successful, ${failCount} failed`);

        return new NextResponse(JSON.stringify({
            message: 'Geocoding completed',
            successCount,
            failCount,
            totalProcessed: applications.length
        }), { status: 200 });

    } catch (error) {
        console.error('Cron job error:', error);
        return new NextResponse(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
} 