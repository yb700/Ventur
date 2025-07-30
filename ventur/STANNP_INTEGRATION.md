# Stannp Integration Documentation

## Overview

This document explains the integration with Stannp API for sending physical letters. The system now generates PDFs from HTML templates and sends them to Stannp for printing and mailing.

## How It Works

1. **Template Creation**: Users create letter templates using the template editor with dynamic fields
2. **PDF Generation**: When sending letters, the system:
   - Renders the HTML template with application data
   - Converts the HTML to PDF using Puppeteer
   - Uploads the PDF to Supabase Storage
   - Sends the PDF URL to Stannp API
3. **Letter Sending**: Stannp prints and mails the physical letters

## Key Changes Made

### 1. Updated Send Letters API (`/api/send-letters/route.ts`)

- **PDF Generation**: Uses Puppeteer to convert HTML templates to PDF
- **Template Rendering**: Replaces dynamic fields with actual application data
- **Address Parsing**: Automatically parses single-line addresses into proper address components (address1, address2, town, postcode)
- **File Upload**: Uploads generated PDFs to Supabase Storage
- **Stannp Integration**: Uses the `file` parameter instead of `template` parameter
- **Error Handling**: Comprehensive logging and error handling

### 2. Template System

- **Dynamic Fields**: Supports variables like `{{ applicant_name }}`, `{{ address }}`, etc.
- **Layouts**: Two layout options (Classic and Modern) designed to match [Stannp's A4 letter template guidelines](https://www.stannp.com/website-2022/assets/docs/templates/stannp_a4_letter_template.pdf)
- **Logo Support**: Users can upload company logos
- **Preview**: Real-time preview of how letters will look
- **Stannp Compliance**: Templates follow A4 dimensions (210mm x 297mm) with proper safe zones and clear zones for address windows

### 3. Database Schema

The system uses these tables:
- `user_templates`: Stores letter templates
- `applications`: Planning application data
- `letters`: Letter records with Stannp IDs
- `transactions`: Payment tracking
- `user_balances`: User account balances

## Testing the Integration

### 1. Test Address Parsing

Visit `/api/test-address` to test address parsing with your example addresses. This will show how single-line addresses are parsed into proper components.

### 2. Test PDF Generation

Visit `/api/test-pdf` to test PDF generation with sample data. This will return a PDF file that you can download and inspect.

### 2. Test Letter Sending

1. Create a template in the template editor
2. Add applications to your bucket
3. Go to the send page
4. Select template and applications
5. Send letters (use test mode first)

### 3. Environment Variables

Make sure these are set in your `.env.local`:

```bash
STANNP_API_KEY=your_stannp_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Stannp API Configuration

### Test Mode vs Production

- **Test Mode**: Set `test=true` in the API call (no charges, sample PDFs)
- **Production Mode**: Set `test=false` (actual printing and mailing)

### Design Guidelines Compliance

The templates are designed to comply with [Stannp's A4 letter template guidelines](https://www.stannp.com/website-2022/assets/docs/templates/stannp_a4_letter_template.pdf):

- **A4 Dimensions**: 210mm x 297mm (exact A4 format)
- **Safe Zones**: 20mm margins from edges to prevent content from being cut off
- **Clear Zones**: Reserved areas for address windows (80mm x 40mm in top-right)
- **Typography**: Professional fonts (Times New Roman for Classic, Arial for Modern)
- **Spacing**: Proper line spacing and paragraph margins for readability

### API Parameters Used

- `file`: URL to the generated PDF
- `recipient[title]`: Mr/Mrs/Miss/Ms/Dr
- `recipient[firstname]`: First name
- `recipient[lastname]`: Last name
- `recipient[address1]`: First line of address
- `recipient[address2]`: Second line of address (if applicable)
- `recipient[town]`: Town/city
- `recipient[postcode]`: UK postcode
- `recipient[country]`: GB (for UK)

### Cost Structure

- Current cost per letter: 75 pence
- Balance is deducted before sending
- Failed sends should be refunded (implement error handling)

## Troubleshooting

### Common Issues

1. **PDF Generation Fails**
   - Check Puppeteer installation
   - Verify Chromium is available
   - Check console logs for errors

2. **Stannp API Errors**
   - Verify API key is correct
   - Check PDF URL is accessible
   - Ensure recipient address format is correct

3. **Storage Upload Fails**
   - Check Supabase Storage permissions
   - Verify bucket exists (`user-content`)
   - Check file size limits

### Debugging

The API includes comprehensive logging. Check your server logs for:
- PDF generation status
- Upload success/failure
- Stannp API responses
- Database operation results

## Production Considerations

1. **Error Handling**: Implement proper rollback for failed operations
2. **Rate Limiting**: Consider rate limiting for large batches
3. **Monitoring**: Set up alerts for failed letter sends
4. **Backup**: Consider backup PDF storage
5. **Compliance**: Ensure GDPR compliance for address data

## Future Enhancements

1. **Letter Tracking**: Track delivery status from Stannp
2. **Batch Processing**: Process large batches more efficiently
3. **Template Library**: Pre-built templates for common use cases
4. **Address Validation**: Validate addresses before sending
5. **Cost Optimization**: Bulk discounts and cost tracking 