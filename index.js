const cheerio = require('cheerio');
const wget = require('wget-improved');
let fs = require('fs');


const source = 'http://0.0.0.0:1234/test.html';
outputFile = './output/archive.html';

///helper functions 

const fetchData = (callback) => {
    let download = wget.download(source, outputFile);
    return download.on('end', () => {
        return callback();
    });
};

const readData = () => {
    return data = fs.readFileSync(outputFile, 'utf8').toString('utf8');
}


//create tree with ids and classes if available.
const constructTree = async () => {
    let structure = {};

    await fetchData(readData)
    let string = readData();
    // console.log("html string for cherio", string);
    const $ = cheerio.load(string)
    $.html();

    console.log($('#superTitle').text());
    console.log($.root().html());


};


constructTree();



