const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUpload() {
  try {
    const filePath = path.join(__dirname, 'test_image.txt');
    fs.writeFileSync(filePath, 'dummy image content');

    const form = new FormData();
    form.append('image', fs.createReadStream(filePath));

    console.log("Attempting upload to http://localhost:5000/upload...");
    const res = await axios.post('http://localhost:5000/upload', form, {
      headers: {
        ...form.getHeaders()
      }
    });

    const output = `Upload Success!\nResponse: ${JSON.stringify(res.data)}`;
    fs.writeFileSync('test_result.txt', output);
    console.log(output);

    fs.unlinkSync(filePath);
  } catch (error) {
    let output = `Upload Failed!\n`;
    if (error.response) {
      output += `Status: ${error.response.status}\nData: ${JSON.stringify(error.response.data).substring(0, 200)}`;
    } else {
      output += `Error: ${error.message}`;
    }
    fs.writeFileSync('test_result.txt', output);
    console.log(output);
  }
}

testUpload();
