
//Server.js
require('dotenv').config(); 
const express = require('express');
const OpenAI = require('openai');
const path = require('path');
const fs = require('fs');


// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
    //apiKey: '----your-OpenAI-API-key-here----'
});

// Create an Express app
const app = express();
app.use(express.json());

app.post('/generate-site', async (req, res) => {
    const { businessName, domain } = req.body;
    // Generate a unique folder name based on businessName
    let folderName = businessName.replace(/\s+/g, '-').toLowerCase(); // Replace spaces with hyphens and convert to lowercase
    let folderPath = path.join(__dirname, folderName);
    let counter = 1;

    // Check if the folder already exists and if so, increment the name
    while (fs.existsSync(folderPath)) {
        folderName = `${businessName.replace(/\s+/g, '-').toLowerCase()}-${counter}`;
        folderPath = path.join(__dirname, folderName);
        counter++;
    }
    
        
    try {
        const prompt = `
        You are an expert web developer. Generate a complete website including HTML, CSS, and JavaScript for a business named "${businessName}" and a domain related to "${domain}". Provide the HTML, CSS, and JS code in separate sections with clear delimiters or labels as follows:
            - HTML section should be enclosed within <!-- HTML Start --> and <!-- HTML End -->
            - CSS section should be enclosed within /* CSS Start */ and /* CSS End */
            - JavaScript section should be enclosed within // JS Start and // JS End

        Make sure that each section is clearly separated, and there are no extra backticks or code blocks surrounding the content.
        Also ensure that website is pretty(CSS-heavy), clearly visible, colourful, professional and fully functional`;
        // Fetch completion from OpenAI with a prompt to generate a full website
        const completion = await openai.chat.completions.create({
            messages: [{
                role: 'system',
                content: prompt,
             }],
            model: 'gpt-4o-mini',
        });

        // Extract content for HTML, CSS, and JS from the response
        const content = completion.choices[0]?.message?.content || '';
       
        // Parse the content (assume it’s separated by labels or delimiters)
        const htmlMatch = content.match(/<!-- HTML Start -->([\s\S]*?)<!-- HTML End -->/);
        const cssMatch = content.match(/\/\* CSS Start \*\/([\s\S]*?)\/\* CSS End \*\//);
        const jsMatch = content.match(/\/\/ JS Start([\s\S]*?)\/\/ JS End/);
        
        // Ensure that the extracted content does not include unnecessary backticks or code blocks
        const html = htmlMatch ? htmlMatch[1].trim().replace(/```/g, '') : '';
        const css = cssMatch ? cssMatch[1].trim().replace(/```/g, '') : '';
        const js = jsMatch ? jsMatch[1].trim().replace(/```/g, '') : '';
        
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }

        // Define files and their content
        const files = {
            [`${folderPath}/index.html`]: html,
            [`${folderPath}/styles.css`]: css,
            [`${folderPath}/script.js`]: js
        };

        // Write files to directory
        Object.keys(files).forEach(filePath => {
            // Check if filePath exists in files object
            if (files[filePath] === undefined) {
                console.error(`Error: Content for file ${filePath} is undefined.`);
                return;
            }
            
            // Ensure content is a string or Buffer
            if (typeof files[filePath] !== 'string' && !Buffer.isBuffer(files[filePath])) {
                console.error(`Error: Invalid content for file ${filePath}. Must be a string or Buffer.`);
                return;
            }
        
            // Attempt to write the file
            try {
                fs.writeFileSync(filePath, files[filePath]);
                console.log(`Successfully wrote to: ${filePath}`);
            } catch (error) {
                console.error(`Error writing to ${filePath}: ${error.message}`);
            }
        });
        // Dynamically import 'open' to open the file
        const { default: open } = await import('open');

        // Open the HTML file in the default browser
        const htmlFilePath = path.join(folderPath, 'index.html');
        open(htmlFilePath);

        res.json({ message: 'Site generated and opened in browser' });
    } catch (error) {
        console.error('Error generating site:', error);
        res.status(500).send('Error generating site');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

