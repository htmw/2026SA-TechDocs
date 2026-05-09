<div align="center">
    <img src="public/nutriai_logo.png" alt="Logo" width="64"/>
    <h1>NutriAI</h1>
    <p>
        NutriAI is an AI-powered nutrition and weight management web application that uses machine learning to predict appetite risk, energy trends, and weight loss success while also creating personalized diet plans.
    </p>
</div>

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Running on Local Machine](#running-on-local-machine)
    - [Fresh Install](#fresh-install)
    - [Updating your Local Version](#updating-your-local-version)
    - [Starting AI Service](#starting-ai-service)
    - [Starting NutriAI Core Application](#starting-nutriai-core-application)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Authors](#authors)

## Getting Started

### Prerequisites

1) [Node.js](https://nodejs.org/en/download)
2) npm
    - Comes pre-installed with Node.js
3) [MongoDB](https://www.mongodb.com/)
    - Make sure you have a MongoDB server running, either locally or using MongoDB Atlas
4) [Python](https://www.python.org/downloads/)
4) [OpenAI_API_Key](https://platform.openai.com/login)
    - Optional

### Running on Local Machine

#### Fresh Install
1) Clone this repository
    ```sh
    git clone https://github.com/htmw/2026SA-TechDocs.git
    ```
2) Navigate to the `code` directory
3) Make a copy of the file `env.example` and rename the copy to `.env`
4) Type in your MongoDB URI into the `MONGODB_URL` field
    - Make sure the URI includes the database name
5) Type in your OpenAI API Key into the `OPENAI_API_KEY` field
    - This step is optional
    - if left empty, chat feature will not work properly
6) Type the AI Service URL into the `AI_RECOMMENDER_URL` field
    - The default URL is `localhost:8000` or `http://127.0.0.1:8000`
7) Run `npm install` to install all of the dependencies
8) Navigate back to the root directory of the repository
9) Navigate to the `python-api` directory
10) Run the command `python -m venv .venv` to create a virtual environment
    - For mac/Unix enviroments use: `python3 -m venv .venv`
11) Once the environment has been created run the command `.venv\Scripts\activate` to enter the virtual environment
    - For mac/Unix: `source .venv\bin\activate`
12) Run `pip install -r requirements.txt` to install the Python dependencies

#### Updating your Local Version
1) Navigate to where you cloned this repo
2) Run `git pull --rebase` to get the latest changes
3) Navigate to the `code` directory
4) Run `npm install` to get any newly added dependencies

#### Starting AI Service
1) Navigate to the `python-api` directory
2) Run `uvicorn main:app` to start the Python Server
3) The AI Recommender Server will now be running on port `8000`
4) Open [http://localhost:8000](http://localhost:8000) with your browser to verify it is running

#### Starting NutriAI Core Application
1) Navigate to the `code` directory
2) Run `npm run dev` to start the web server
3) Open [http://localhost:3000](http://localhost:3000) with your browser

## Deployment

- [Deployment Guide](#)

## Documentation

- [Doc](#)

## Authors

- [Alan Tsui](https://github.com/Kingal1337)
- [Angel Flores](https://github.com/angelfo7319)
- [Erin Sorbella](https://github.com/esorbella)
- [James Ambenge](https://github.com/James-Ambenge)
- [Qui Neubauer](https://github.com/quipixel)
- [Saba Alam](https://github.com/sabaalam9730)