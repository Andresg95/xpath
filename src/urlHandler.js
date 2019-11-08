const axios = require('axios');
const fs = require('fs');




const fetchData = async (source) => {

    let result;
    await axios(
        source
    ).then(response => {

        result = response.data
    })
        .catch(err => {
            result = "Err"
        })

    return await result;
};


const readData = (outputFile) => {
    return data = fs.readFileSync(outputFile, 'utf8').toString('utf8');
};


module.exports = {
    fetchData, 
    readData
}