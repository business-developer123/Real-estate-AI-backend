import { Request, Response } from 'express';
import { analysisReport, classifyQuestion, queryQuestion } from '../lib/assistant';
import { listingAssistant } from '../lib/listingAssistant';
import axios from 'axios';
import { analysisAssistant } from '../lib/analysisAssistant';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import pdf from 'pdf-parse';
import { getData, getOneHistory, saveData, updateData } from '../lib/realEstateData';
import puppeteer from 'puppeteer';

// For PDF processing, use pdf-parse library
const extractPdfText = async (buffer: Buffer): Promise<string> => {
    try {
        const data = await pdf(buffer);
        return data.text;
    } catch (error) {
        console.error('Error parsing PDF:', error);
        return "Error parsing PDF file.";
    }
};

export const analyzeProperty = async (req: Request, res: Response) => {
    let inputData = '';
    try {
        const { userInput, lastQuestion, id } = req.body;

        inputData = userInput;

        if (lastQuestion) {
            const question = await queryQuestion(userInput);

            if (question === 'true') {
                inputData = lastQuestion;
            } else if (question === 'false') {
                res.status(200).json({ description: 'Then ask a question again!', type: "noMessage" });
                return;
            } else {
                inputData = userInput;
            }
        }

        const classifyResult = await classifyQuestion(inputData);

        switch (classifyResult) {
            case 'listing':
                const listingResult = await listingAssistant(inputData);
                if (id) res.status(200).json(await updateData(id, listingResult));
                else res.status(200).json(await saveData(listingResult));
                break;
            case 'analysis':
                const analysisResult = await analysisAssistant(inputData);
                if (id) res.status(200).json(await updateData(id, analysisResult));
                else res.status(200).json(await saveData(analysisResult));
                break;
            default:
                res.status(400).json({ message: 'Invalid question type' });
                break;
        }
    } catch (error) {
        console.error('Error analyzing property:', error);
        res.status(500).json({ error: 'Failed to analyze property' });
    }
};

export const getStreetView = async (req: Request, res: Response) => {
    try {
        const { location } = req.body;
        const response = await axios.get(location);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error getting street view:', error);
        res.status(500).json({ error: 'Failed to get street view' });
    }
};

export const analyzeFile = async (req: Request, res: Response) => {
    let document = '';
    try {
        const file = req.file;
        if (!file) {
            res.status(400).json({ result: 'No file uploaded' });
            return;
        }
        const fileType = file.mimetype;
        if (fileType === 'application/pdf') {
            // PDF: extract text using pdf-parse
            const text = await extractPdfText(file.buffer);
            document = text;
        } else if (
            fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            fileType === 'application/vnd.ms-excel'
        ) {
            // Excel
            const workbook = XLSX.read(file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const csv = XLSX.utils.sheet_to_csv(worksheet);
            document = csv;
        } else if (
            fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            fileType === 'application/msword'
        ) {
            // Word: extract text
            const result = await mammoth.extractRawText({ buffer: file.buffer });
            document = result.value;
        } else {
            res.status(400).json({ result: 'Unsupported file type' });
            return;
        }
    } catch (err) {
        res.status(500).json({ result: 'Error analyzing file' });
        return;
    }

    let documentCleaned = document.replace("\n", "");

    try {
        const classifyResult = await classifyQuestion(documentCleaned);

        switch (classifyResult) {
            case 'listing':
                const listingResult = await listingAssistant(documentCleaned);
                res.status(200).json(listingResult);
                break;
            case 'analysis':
                const analysisResult = await analysisAssistant(documentCleaned);
                res.status(200).json(analysisResult);
                break;
            default:
                res.status(400).json({ message: 'Invalid question type' });
                break;
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to analyze property' });
    }
};

export const getHistories = async (req: Request, res: Response) => {
    try {
        const { email } = req.query;
        const response = await getData(email as string);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json("Get history error!");
    }
};

export const getHistory = async (req: Request, res: Response) => {
    const { id } = req.query;
    try {
        const response = await getOneHistory(id as string);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json("Get a history error!");
    }
};

export const getReport = async (req: Request, res: Response) => {
    const { listing } = req.body;
    try {
        // Get the analysis from OpenAI
        const analysisResult = await analysisReport(listing);

        if (!analysisResult) {
            res.status(500).json({ error: "Failed to generate analysis" });
            return;
        }

        // Create HTML template for PDF
        const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 20px;
                    color: #333;
                }
                .header {
                    text-align: center;
                    border-bottom: 3px solid #7c3aed;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .logo {
                    font-size: 24px;
                    font-weight: bold;
                    color: #7c3aed;
                    margin-bottom: 10px;
                }
                .property-title {
                    font-size: 28px;
                    font-weight: bold;
                    margin: 10px 0;
                    color: #222;
                }
                .property-subtitle {
                    font-size: 16px;
                    color: #666;
                    margin-bottom: 5px;
                }
                .price {
                    font-size: 24px;
                    font-weight: bold;
                    color: #7c3aed;
                    margin: 10px 0;
                }
                .property-details {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    margin: 15px 0;
                    flex-wrap: wrap;
                }
                .detail-item {
                    background: #f8f9fa;
                    padding: 10px 15px;
                    border-radius: 8px;
                    font-weight: 600;
                }
                .property-images {
                    display: flex;
                    justify-content: center;
                    gap: 20px;
                    margin: 20px 0;
                    flex-wrap: wrap;
                }
                .property-image {
                    width: 300px;
                    height: 200px;
                    object-fit: cover;
                    border-radius: 8px;
                    border: 2px solid #e5e7eb;
                }
                .image-placeholder {
                    width: 300px;
                    height: 200px;
                    background: #f3f4f6;
                    border: 2px dashed #d1d5db;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #6b7280;
                    font-weight: 600;
                }
                .content {
                    max-width: 800px;
                    margin: 0 auto;
                }
                h1, h2, h3 {
                    color: #7c3aed;
                    margin-top: 30px;
                }
                h2 {
                    border-bottom: 2px solid #e5e7eb;
                    padding-bottom: 10px;
                }
                .analysis-content {
                    background: white;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 15px 0;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 12px;
                    text-align: left;
                }
                th {
                    background-color: #7c3aed;
                    color: white;
                }
                .footer {
                    text-align: center;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #e5e7eb;
                    color: #666;
                    font-size: 14px;
                }
                @media print {
                    body { margin: 0; }
                    .header { page-break-inside: avoid; }
                }
                ul, ol {
                    margin: 10px 0;
                    padding-left: 20px;
                }
                li {
                    margin: 5px 0;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">💡 Simple Deals - Property Report</div>
                <div class="property-title">${listing.streetAddress || 'Property Analysis'}</div>
                <div class="property-subtitle">${listing.city || ''}, ${listing.state || ''} ${listing.zipcode || ''}</div>
                <div class="price">$${listing.price ? listing.price.toLocaleString() : 'N/A'}</div>
                <div class="property-details">
                    <div class="detail-item">${listing.bedrooms || 0} Bedrooms</div>
                    <div class="detail-item">${listing.bathrooms || 0} Bathrooms</div>
                    <div class="detail-item">${listing.livingArea ? listing.livingArea.toLocaleString() : 'N/A'} sq ft</div>
                </div>
                <div class="property-subtitle">Report Generated: ${new Date().toLocaleDateString()}</div>
            </div>
            
            <div class="content">
                <div class="analysis-content">
                    ${analysisResult}
                </div>
            </div>
            
            <div class="footer">
                <p>This report was generated by Simple Deals AI analysis system.</p>
                <p>For informational purposes only. Consult with qualified professionals before making investment decisions.</p>
            </div>
        </body>
        </html>
        `;

        // Generate PDF using Puppeteer
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setContent(htmlTemplate, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });

        await browser.close();

        // Set response headers for PDF download
        const fileName = `property-report-${listing.streetAddress?.replace(/\s+/g, '-') || 'property'}-${Date.now()}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', pdfBuffer.length);

        // Send the PDF
        res.send(pdfBuffer);

    } catch (error) {
        console.error("Get report error:", error);
        res.status(500).json({ error: "Failed to generate report" });
    }
};