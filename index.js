require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const AWS = require('aws-sdk');

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// AWS DynamoDB setup
AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "NewsArticles";

const API_KEY = process.env.API_KEY;

// Function to save article to DynamoDB
async function saveArticle(article) {
    const params = {
        TableName: TABLE_NAME,
        Item: {
            articleId: Buffer.from(article.url).toString('base64'), // unique id
            title: article.title,
            description: article.description,
            content: article.content,
            author: article.author,
            source: article.source.name,
            publishedAt: article.publishedAt,
            category: article.category || 'general',
            url: article.url,
            imageUrl: article.urlToImage
        }
    };

    try {
        await dynamoDB.put(params).promise();
    } catch (err) {
        console.error("DynamoDB Save Error:", err.message);
    }
}

// Function to fetch news from API and save to DB
async function fetchNews(url, category, res) {
    try {
        const response = await axios.get(url);
        if (response.data.totalResults > 0) {
            const articles = response.data.articles;
            // Save articles to DynamoDB
            for (let art of articles) {
                art.category = category; // attach category for DB
                await saveArticle(art);
            }
            res.json({
                status: 200,
                success: true,
                message: "Successfully fetched and saved data",
                data: articles
            });
        } else {
            res.json({
                status: 200,
                success: true,
                message: "No more results"
            });
        }
    } catch (error) {
        res.json({
            status: 500,
            success: false,
            message: "Failed to fetch data from the API",
            error: error.message
        });
    }
}

// Routes

// All news
app.get("/all-news", (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let pageSize = parseInt(req.query.pageSize) || 40;
    let url = `https://newsapi.org/v2/everything?q=page=${page}&pageSize=${pageSize}&apiKey=${API_KEY}`;
    fetchNews(url, 'general', res);
});

// Country-specific news
app.get("/country/:iso", (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let pageSize = parseInt(req.query.pageSize) || 40;
    const country = req.params.iso;
    let url = `https://newsapi.org/v2/top-headlines?country=${country}&page=${page}&pageSize=${pageSize}&apiKey=${API_KEY}`;
    fetchNews(url, 'general', res);
});

// Top headlines by category
app.get("/top-headlines", (req, res) => {
    let page = parseInt(req.query.page) || 1;
    let pageSize = parseInt(req.query.pageSize) || 40;
    let category = req.query.category || "general";
    let url = `https://newsapi.org/v2/top-headlines?language=en&page=${page}&pageSize=${pageSize}&category=${category}&apiKey=${API_KEY}`;
    fetchNews(url, category, res);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server Running on Port ${PORT}`);
});
