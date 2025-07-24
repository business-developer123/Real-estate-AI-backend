import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import router from './routes/index';
import { SupabaseConnection } from './utils/supabase';
dotenv.config();

const app = express();
const port = process.env.PORT || 1001;
const corsOptions = {
  origin: 'https://real-estate-ai-frontend.vercel.app', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'FETCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.raw());

app.use('/api/v1', router);

SupabaseConnection();

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});