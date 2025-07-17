import { json, Request, Response } from 'express';
import { classifyQuestion, queryQuestion } from '../lib/assistant';
import { listingAssistant } from '../lib/listingAssistant';
import axios from 'axios';
import { analysisAssistant } from '../lib/analysisAssistant';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import pdf from 'pdf-parse';

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
        const { userInput, lastQuestion } = req.body;

        inputData = userInput;
        console.log(lastQuestion);
        if (lastQuestion) {
            const question = await queryQuestion(userInput);
            console.log(question);
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
                res.status(200).json(listingResult);
                break;
            case 'analysis':
                const analysisResult = await analysisAssistant(inputData);
                res.status(200).json(analysisResult);
                break;
            default:
                res.status(400).json({ message: 'Invalid question type' });
                break;
        }
        return;
    } catch (error) {
        console.error('Error analyzing property:', error);
        res.status(500).json({ error: 'Failed to analyze property' });
    }
}

export const getStreetView = async (req: Request, res: Response) => {
    try {
        const { location } = req.body;
        const response = await axios.get(location);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error getting street view:', error);
        res.status(500).json({ error: 'Failed to get street view' });
    }
}

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
        }
    } catch (err) {
        res.status(500).json({ result: 'Error analyzing file' });
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
        return;
    } catch (error) {
        res.status(500).json({ error: 'Failed to analyze property' });
    }
};   