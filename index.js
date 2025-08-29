require('dotenv').config();
const express = require('express');
const axios = require('axios'); //used to fetch data from api
const cors = require('cors');

const app = express();

// Allow requests from any origin
app.use(cors()); //front end tries to call api from backend
app.use(express.urlencoded({extended:true}));  // To parse form data (true for passing nested objects)

const API_KEY = process.env.API_KEY;

function fetchNews(url,res)
{
    axios.get(url)
    .then(response=>{
        if(response.data.totalResults>0)
        {
            res.json({
                status:200,
                success:true,
                message: "Successfully fetched data",
                data:response.data
            });
        }
        else
        {
            res.json({
                status:200,
                success:true,
                message: " No more results"
            });
        }
    })
    .catch(error=>{
        res.json({
            status:500,
            success:false,
            message: "Failed to fetch data from the API",
            error:error.message
        });
    });
}

//Routes
//all news
app.get("/all-news",(req,res)=>{
    //parameters from api documentation
    let page = parseInt(req.query.page) || 1;
    let pageSize = parseInt(req.query.pageSize) || 40;
    let url = `https://newsapi.org/v2/everything?q=page=${page}&pageSize=${pageSize}&apiKey=${API_KEY}`;
    fetchNews(url,res);
});

//country specific
app.options("/country/:iso",cors());
app.get("/country/:iso",(req,res)=>{
    let page = parseInt(req.query.page) || 1;
    let pageSize = parseInt(req.query.pageSize) || 40;
    const country = req.params.iso;
    let url = `https://newsapi.org/v2/top-headlines?country=${country}&page=${page}&pageSize=${pageSize}&apiKey=${API_KEY}`;
    fetchNews(url,res);
})

//top headlines - category specific
app.options("/top-headlines",cors());
app.get("/top-headlines",(req,res)=>{
    let page = parseInt(req.query.page) || 1;
    let pageSize = parseInt(req.query.pageSize) || 40;
    let category = req.query.category || "general"; //default category = 'business'
    let url = `https://newsapi.org/v2/top-headlines?language=en&page=${page}&pageSize=${pageSize}&category=${category}&apiKey=${API_KEY}`;
    fetchNews(url,res);
})

const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log(`Server Running on Port ${PORT}`)
});

