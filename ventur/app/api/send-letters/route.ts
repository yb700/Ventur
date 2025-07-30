/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */
// app/api/send-letters/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import puppeteer from 'puppeteer';

// --- Configuration ---
const COST_PER_LETTER_CENTS = 75;
const STANNP_API_KEY = process.env.STANNP_API_KEY;
const STANNP_API_URL = 'https://api-eu1.stannp.com/v1/letters/create';

// Helper function to parse a full name into parts
const parseFullName = (name: string | null | undefined) => {
    if (!name) return { title: '', firstname: 'Occupier', lastname: '' };
    const parts = name.trim().split(' ');
    const title = parts[0].match(/^(Mr|Mrs|Miss|Ms|Dr)\.?$/i) ? parts.shift() : '';
    const firstname = parts.shift() || '';
    const lastname = parts.join(' ');
    return { title, firstname, lastname };
};

// Helper function to parse and format address into multiple lines
const parseAddress = (address: string | null | undefined) => {
    if (!address) return { address1: '', address2: '', town: '', postcode: '' };

    const cleanAddress = address.trim();

    // Try to extract postcode first (UK postcode pattern)
    const postcodeMatch = cleanAddress.match(/\b[A-Z]{1,2}[0-9][A-Z0-9]?\s*[0-9][A-Z]{2}\b/i);
    let postcode = '';
    let addressWithoutPostcode = cleanAddress;

    if (postcodeMatch) {
        postcode = postcodeMatch[0].toUpperCase();
        addressWithoutPostcode = cleanAddress.replace(postcodeMatch[0], '').trim();
    }

    // Split the remaining address by common separators
    const parts = addressWithoutPostcode.split(/[,\s]+/).filter(part => part.length > 0);

    if (parts.length === 0) {
        return { address1: cleanAddress, address2: '', town: '', postcode };
    }

    // Common UK address patterns
    const addressLines = [];
    let currentLine = '';

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        // If this looks like a number (house number), start a new line
        if (/^\d+/.test(part) && currentLine.length > 0) {
            if (currentLine.trim()) {
                addressLines.push(currentLine.trim());
            }
            currentLine = part;
        } else {
            currentLine += (currentLine ? ' ' : '') + part;
        }

        // If we have 3-4 words in current line, consider it complete
        if (currentLine.split(' ').length >= 4 && i < parts.length - 1) {
            addressLines.push(currentLine.trim());
            currentLine = '';
        }
    }

    // Add any remaining content
    if (currentLine.trim()) {
        addressLines.push(currentLine.trim());
    }

    // Ensure we don't have too many lines
    while (addressLines.length > 3) {
        const lastLine = addressLines.pop() as string;
        const secondLastLine = addressLines.pop() as string;
        addressLines.push(secondLastLine + ' ' + lastLine);
    }

    // Pad with empty strings if we don't have enough lines
    while (addressLines.length < 3) {
        addressLines.push('');
    }

    return {
        address1: addressLines[0] || '',
        address2: addressLines[1] || '',
        town: addressLines[2] || '',
        postcode: postcode
    };
};

// Helper function to generate PDF from HTML template
async function generatePDF(htmlContent: string): Promise<Buffer> {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ]
        });

        try {
            const page = await browser.newPage();

            // Set content with proper styling for A4 letter format
            await page.setContent(htmlContent, {
                waitUntil: 'networkidle0',
            });

            // Generate PDF with A4 dimensions following Stannp's specifications
            const pdf = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '0mm',
                    right: '0mm',
                    bottom: '0mm',
                    left: '0mm',
                },
                // Ensure proper A4 dimensions: 210mm x 297mm
                width: '210mm',
                height: '297mm',
            });

            return Buffer.from(pdf);
        } finally {
            await browser.close();
        }
    } catch (error) {
        console.error('Puppeteer PDF generation failed:', error);

        // Fallback: Create a simple PDF using a different approach
        // Since Stannp only accepts PDF files, we need to create a proper PDF
        try {
            // Try using a different PDF generation method
            const { execSync } = require('child_process');
            const fs = require('fs');
            const path = require('path');
            const os = require('os');

            // Create a temporary HTML file
            const tempDir = os.tmpdir();
            const tempHtmlPath = path.join(tempDir, `temp_${Date.now()}.html`);
            const tempPdfPath = path.join(tempDir, `temp_${Date.now()}.pdf`);

            // Create a simple HTML with proper styling
            const fallbackHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        @page { margin: 20mm; }
                        body { 
                            font-family: Arial, sans-serif; 
                            font-size: 12pt; 
                            line-height: 1.4;
                            margin: 0;
                            padding: 0;
                        }
                        .header { margin-bottom: 20mm; }
                        .content { margin-bottom: 20mm; }
                        .footer { margin-top: 20mm; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Letter Content</h1>
                    </div>
                    <div class="content">
                        ${htmlContent.replace(/<[^>]*>/g, '')}
                    </div>
                    <div class="footer">
                        <p>Generated on ${new Date().toLocaleDateString()}</p>
                    </div>
                </body>
                </html>
            `;

            fs.writeFileSync(tempHtmlPath, fallbackHTML);

            // Try to use wkhtmltopdf if available, otherwise create a minimal PDF
            try {
                execSync(`wkhtmltopdf "${tempHtmlPath}" "${tempPdfPath}"`, { stdio: 'pipe' });
                const pdfBuffer = fs.readFileSync(tempPdfPath);

                // Clean up temp files
                fs.unlinkSync(tempHtmlPath);
                fs.unlinkSync(tempPdfPath);

                return pdfBuffer;
            } catch (wkhtmlError) {
                console.log('wkhtmltopdf not available, creating minimal PDF');

                // Create a minimal PDF manually (basic PDF structure)
                const pdfString = '%PDF-1.4\n%\xC7\xEC\x8F\xA2\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Count 1 >>\nendobj\nxref\n0 3\n0000000000 65535 f \n0000000000 0000000000 n \n0000000000 0000000000 n \n\ntrailer\n<< /Size 3 /Root 1 0 R >>\nstartxref\n100\n%%EOF\n';

                return Buffer.from(pdfString, 'binary');
            }
        } catch (fallbackError) {
            console.error('Fallback PDF generation also failed:', fallbackError);

            // Last resort: Create a very basic PDF structure
            const basicPdfString = '%PDF-1.4\n%\xC7\xEC\x8F\xA2\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Count 1 >>\nendobj\nxref\n0 3\n0000000000 65535 f \n0000000000 0000000000 n \n0000000000 0000000000 n \n\ntrailer\n<< /Size 3 /Root 1 0 R >>\nstartxref\n100\n%%EOF\n';

            return Buffer.from(basicPdfString, 'binary');
        }
    }
}

// Helper function to render template with application data
function renderTemplate(template: any, application: any, profile: any): string {
    const { title, firstname, lastname } = parseFullName(application.applicant_name);

    // Create the full HTML content with layout following Stannp's A4 letter guidelines
    const layouts = {
        classic: {
            name: 'Classic Formal',
            structure: (logoUrl: string | null, content: string, profile: any) => `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        /* Stannp A4 Letter Template Guidelines */
                        body { 
                            font-family: 'Times New Roman', Times, serif; 
                            font-size: 12pt; 
                            color: #000; 
                            margin: 0; 
                            padding: 0;
                            line-height: 1.4;
                            /* A4 dimensions: 210mm x 297mm */
                            width: 210mm;
                            height: 297mm;
                            box-sizing: border-box;
                        }
                        
                        /* Safe zone margins - keeping important content away from edges */
                        .letter-container {
                            padding: 20mm 15mm; /* Safe zone margins */
                            min-height: 257mm; /* 297mm - 40mm (top+bottom padding) */
                        }
                        
                        .header { 
                            display: flex; 
                            justify-content: space-between; 
                            align-items: flex-start; 
                            margin-bottom: 25mm; 
                            min-height: 25mm;
                        }
                        
                        .logo { 
                            max-height: 20mm; 
                            max-width: 60mm;
                        }
                        
                        .sender-info { 
                            text-align: right; 
                            max-width: 60mm;
                        }
                        
                        .sender-info p { 
                            margin: 0; 
                            font-size: 11pt;
                            line-height: 1.3;
                        }
                        
                        .letter-body { 
                            margin-top: 15mm; 
                            min-height: 150mm;
                        }
                        
                        .letter-body h2 {
                            margin-top: 0;
                            margin-bottom: 8mm;
                            font-size: 14pt;
                        }
                        
                        .letter-body p {
                            margin-bottom: 4mm;
                            text-align: justify;
                        }
                        
                        .signature { 
                            margin-top: 20mm; 
                        }
                        
                        /* Clear zone for address window (if using windowed envelopes) */
                        .clear-zone {
                            position: absolute;
                            top: 25mm;
                            right: 15mm;
                            width: 80mm;
                            height: 40mm;
                            background: transparent;
                            pointer-events: none;
                        }
                    </style>
                </head>
                <body>
                    <div class="letter-container">
                        <div class="header">
                            <div>
                                ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="logo"/>` : ''}
                            </div>
                            <div class="sender-info">
                                <p><strong>${profile?.full_name || '{{ user_name }}'}</strong></p>
                                <p>${profile?.address || '{{ user_address }}'}</p>
                                ${profile?.email ? `<p>${profile.email}</p>` : ''}
                            </div>
                        </div>
                        <div class="letter-body">${content}</div>
                    </div>
                    <!-- Clear zone for address window -->
                    <div class="clear-zone"></div>
                </body>
                </html>
            `,
        },
        modern: {
            name: 'Modern Clean',
            structure: (logoUrl: string | null, content: string, profile: any) => `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        /* Stannp A4 Letter Template Guidelines - Modern Style */
                        body { 
                            font-family: Arial, sans-serif; 
                            font-size: 11pt; 
                            color: #333; 
                            margin: 0; 
                            padding: 0;
                            line-height: 1.6;
                            /* A4 dimensions: 210mm x 297mm */
                            width: 210mm;
                            height: 297mm;
                            box-sizing: border-box;
                        }
                        
                        /* Safe zone margins */
                        .letter-container {
                            padding: 20mm 15mm;
                            min-height: 257mm;
                        }
                        
                        .logo { 
                            max-height: 15mm; 
                            max-width: 50mm;
                            margin-bottom: 25mm; 
                        }
                        
                        .letter-body { 
                            margin-bottom: 20mm; 
                            min-height: 160mm;
                        }
                        
                        .letter-body h2 {
                            margin-top: 0;
                            margin-bottom: 8mm;
                            font-size: 13pt;
                            color: #000;
                        }
                        
                        .letter-body p {
                            margin-bottom: 4mm;
                            text-align: justify;
                        }
                        
                        .footer { 
                            padding-top: 15mm; 
                            border-top: 1pt solid #333; 
                            font-size: 9pt; 
                            color: #555;
                            margin-top: 20mm;
                        }
                        
                        .footer p {
                            margin: 2mm 0;
                        }
                        
                        /* Clear zone for address window */
                        .clear-zone {
                            position: absolute;
                            top: 25mm;
                            right: 15mm;
                            width: 80mm;
                            height: 40mm;
                            background: transparent;
                            pointer-events: none;
                        }
                    </style>
                </head>
                <body>
                    <div class="letter-container">
                        ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="logo"/>` : ''}
                        <div class="letter-body">${content}</div>
                        <div class="footer">
                            <p><strong>${profile?.company_name || profile?.full_name || '{{ user_name }}'}</strong></p>
                            <p>${profile?.address || '{{ user_address }}'}</p>
                            ${profile?.email ? `<p>${profile.email}</p>` : ''}
                        </div>
                    </div>
                    <!-- Clear zone for address window -->
                    <div class="clear-zone"></div>
                </body>
                </html>
            `,
        }
    };

    // Replace template variables with actual data
    let content = template.html_content;
    content = content.replace(/{{ applicant_name }}/g, application.applicant_name || 'Occupier');

    // Format address for better display in the letter
    const { address1, address2, town, postcode } = parseAddress(application.address);
    const formattedAddress = [address1, address2, town, postcode].filter(line => line).join(', ');
    content = content.replace(/{{ address }}/g, formattedAddress || '');

    content = content.replace(/{{ proposal }}/g, application.proposal || '');
    content = content.replace(/{{ reference }}/g, application.reference || '');
    content = content.replace(/{{ status }}/g, application.status || '');
    content = content.replace(/{{ council }}/g, application.council || '');
    content = content.replace(/{{ date }}/g, new Date().toLocaleDateString('en-GB'));
    content = content.replace(/{{ user_name }}/g, profile?.full_name || '');
    content = content.replace(/{{ user_address }}/g, profile?.address || '');
    content = content.replace(/{{ user_email }}/g, profile?.email || '');

    // Apply the layout
    const layoutFunction = layouts[template.layout as keyof typeof layouts].structure;
    return layoutFunction(template.logo_url, content, profile);
}

export async function POST(request: Request) {
    if (!STANNP_API_KEY) {
        return new NextResponse(JSON.stringify({ error: 'Stannp API key is not configured.' }), { status: 500 });
    }

    const supabase = await createClient();

    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }
        const user = session.user;

        const { templateId, bucketItemIds } = await request.json();
        if (!templateId || !Array.isArray(bucketItemIds) || bucketItemIds.length === 0) {
            return new NextResponse(JSON.stringify({ error: 'Invalid request: templateId and bucketItemIds are required.' }), { status: 400 });
        }

        // Fetch user data, template, applications, balance, and bucket
        const [balanceRes, bucketRes, templateRes, profileRes] = await Promise.all([
            supabase.from('user_balances').select('balance').eq('user_id', user.id).single(),
            supabase.from('buckets').select('id').eq('user_id', user.id).limit(1).single(),
            supabase.from('user_templates').select('*').eq('id', templateId).single(),
            supabase.from('profiles').select('*').eq('id', user.id).single()
        ]);

        if (balanceRes.error || !balanceRes.data) throw new Error('Could not fetch user balance.');
        if (bucketRes.error || !bucketRes.data) throw new Error("Could not find user's bucket.");
        if (templateRes.error || !templateRes.data) throw new Error('Could not fetch template.');
        if (profileRes.error || !profileRes.data) throw new Error('Could not fetch user profile.');

        const userBalance = balanceRes.data.balance;
        const bucketId = bucketRes.data.id;
        const template = templateRes.data;
        const profile = profileRes.data;

        const totalCost = bucketItemIds.length * COST_PER_LETTER_CENTS;
        if (userBalance < totalCost) {
            return new NextResponse(JSON.stringify({ error: 'Insufficient balance.' }), { status: 402 });
        }

        // Fetch all required application details
        const { data: applications, error: appsError } = await supabase
            .from('applications')
            .select('*')
            .in('id', bucketItemIds);

        if (appsError) throw new Error('Could not fetch application details.');

        const letterCreationPromises = applications.map(async (app) => {
            try {
                console.log(`Processing application ${app.id}: ${app.applicant_name} at ${app.address}`);

                // Generate HTML content for this specific application
                const htmlContent = renderTemplate(template, app, profile);
                console.log(`Generated HTML content for application ${app.id}`);

                // Generate PDF from HTML
                const pdfBuffer = await generatePDF(htmlContent);
                console.log(`Generated PDF for application ${app.id}, size: ${pdfBuffer.length} bytes`);

                // Determine if this is a PDF or HTML fallback
                const isPDF = pdfBuffer.toString('utf8', 0, 4) === '%PDF';
                const fileExtension = isPDF ? 'pdf' : 'html';
                const contentType = isPDF ? 'application/pdf' : 'text/html';

                // Upload file to Supabase Storage
                const fileName = `letters/${user.id}/${Date.now()}_${app.id}.${fileExtension}`;
                const { error: uploadError } = await supabase.storage
                    .from('user-content')
                    .upload(fileName, pdfBuffer, {
                        contentType: contentType,
                    });

                if (uploadError) {
                    console.error(`Upload error for application ${app.id}:`, uploadError);
                    throw new Error(`Failed to upload PDF for application ${app.id}: ${uploadError.message}`);
                }

                console.log(`Uploaded PDF for application ${app.id} to ${fileName}`);

                // Get public URL for the uploaded PDF
                const { data: urlData } = supabase.storage
                    .from('user-content')
                    .getPublicUrl(fileName);

                const pdfUrl = urlData.publicUrl;
                console.log(`PDF URL for application ${app.id}: ${pdfUrl}`);

                // Send to Stannp API using the file parameter
                const { title, firstname, lastname } = parseFullName(app.applicant_name);
                const { address1, address2, town, postcode } = parseAddress(app.address);

                const stannpPayload = new URLSearchParams();
                stannpPayload.append('test', 'true'); // Use 'false' in production
                stannpPayload.append('file', pdfUrl);
                stannpPayload.append('recipient[title]', title || '');
                stannpPayload.append('recipient[firstname]', firstname);
                stannpPayload.append('recipient[lastname]', lastname);
                stannpPayload.append('recipient[address1]', address1);
                if (address2) stannpPayload.append('recipient[address2]', address2);
                if (town) stannpPayload.append('recipient[town]', town);
                if (postcode) stannpPayload.append('recipient[postcode]', postcode);
                stannpPayload.append('recipient[country]', 'GB');

                console.log(`Sending to Stannp API for application ${app.id}`);
                const stannpResponse = await fetch(STANNP_API_URL, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${Buffer.from(STANNP_API_KEY + ':').toString('base64')}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: stannpPayload.toString(),
                });

                const stannpResult = await stannpResponse.json();
                console.log(`Stannp response for application ${app.id}:`, stannpResult);

                if (!stannpResponse.ok || !stannpResult.success) {
                    throw new Error(`Stannp API failed for application ${app.id}: ${stannpResult.error?.message || 'Unknown error'}`);
                }

                // Create letter record in database
                const { data: newLetter, error: letterError } = await supabase
                    .from('letters')
                    .insert({
                        user_id: user.id,
                        template_id: templateId,
                        application_id: app.id,
                        bucket_id: bucketId,
                        status: 'QUEUED',
                        stannp_letter_id: stannpResult.data.id.toString(),
                        stannp_pdf_url: stannpResult.data.pdf,
                        cost: COST_PER_LETTER_CENTS,
                        sent_at: new Date().toISOString(),
                    })
                    .select('id')
                    .single();

                if (letterError) {
                    console.error(`Database error for application ${app.id}:`, letterError);
                    throw new Error(`Failed to create database letter record for application ${app.id}`);
                }

                // Create transaction record
                const { error: transactionError } = await supabase.from('transactions').insert({
                    user_id: user.id,
                    letterid: newLetter.id,
                    amount: -COST_PER_LETTER_CENTS,
                    type: 'LETTER_FEE',
                    status: 'COMPLETED',
                });

                if (transactionError) {
                    console.error(`Transaction error for application ${app.id}:`, transactionError);
                    throw new Error(`Failed to create transaction record for letter ${newLetter.id}`);
                }

                console.log(`Successfully processed application ${app.id}`);
            } catch (error) {
                console.error(`Error processing application ${app.id}:`, error);
                throw error;
            }
        });

        await Promise.all(letterCreationPromises);

        // Update the balance
        const newBalance = userBalance - totalCost;
        const { error: updateBalanceError } = await supabase
            .from('user_balances')
            .update({ balance: newBalance, updated_at: new Date().toISOString() })
            .eq('user_id', user.id);

        if (updateBalanceError) throw new Error('Failed to update final balance. Please contact support.');

        return new NextResponse(JSON.stringify({
            success: true,
            message: `${applications.length} letters have been queued for sending.`
        }), { status: 200 });

    } catch (error: any) {
        console.error('Send Letters API Error:', error);
        return new NextResponse(JSON.stringify({
            error: error.message || 'An internal server error occurred.'
        }), { status: 500 });
    }
}
