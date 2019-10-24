const cheerio = require('cheerio');
const wget = require('wget-improved');
let fs = require('fs');
const _ = require('lodash')


const source = 'http://0.0.0.0:1234/test1.html';
outputFile = './output/archive.html';
let finalNodesXpaths = [];


///helper functions 

const fetchData = () => {
    wget.download(source, outputFile);
};

const readData = () => {
    return data = fs.readFileSync(outputFile, 'utf8').toString('utf8');
};


/**
 * 
 * obj {
 *  type: string
 *  children: obj[]
 * }
 * @param {*} obj 
 * {
 *   obj
 * }
 */


const recursive = (obj, parent) => {

    if (obj.type == "tag") {
        //console.log(parent)
        let currentParent = (!_.isEqual(obj.name, "html")) ? `${parent}.${obj.name}` : obj.name;
        const o = {
            [obj.name]: {
                class: obj.attribs.class || "NA",
                id: obj.attribs.id || "NA",
                attributes: obj.attribs || {},
                xpath: currentParent,
                values: obj.children.map((child, index) => {
                    return recursive(child, `${currentParent}.values[${index}]`)
                })
            }
        }
        delete o[obj.name].attributes.id;
        delete o[obj.name].attributes.class;

        return o;
    }
    if (obj.type == "text") {
        //base case
        finalNodesXpaths.push({
            value: obj.data,
            xpath: `${parent}.value`
        })

        return obj.data != "\n" ? { value: obj.data } : obj.data
    }
}


//create tree with ids and classes if available.
const constructTree = async () => {

    await fetchData()
    let string = await readData();
    // console.log("html string for cherio", string);
    const $ = cheerio.load(string)
    $.html();
    const html = $('*').toArray()[0];

    return (recursive(html, "", []));
};



const matchingRegularExp = (number) => {

    //si tienen diferente signos o un unico separador no hay problema

    let numerals = new RegExp(/\d{1,100}[,.'\s]+/, "g"); //for numbers
    //SI CONTIENE:
    let groups = number.toString().match(numerals);
    let lastGroup = groups[groups.length - 1]; //the last symbol used
    let n = `\\${lastGroup.charAt(lastGroup.length - 1)}`

    let firstGroup = groups[0];
    let common = `\\${firstGroup.charAt(firstGroup.length - 1)}`

    console.log("the common separator is ", { common });

    //devuelve 2 grupos, los enteros y los decimales separados por el separator

    let numGroups = RegExp(n, "g");
    let decimalLength = number.toString().split(numGroups)[1].length
    let wholeNs = number.toString().split(numGroups)[0]

    console.log(wholeNs, decimalLength);

    // \d+{1,3}[common]*[decimal]


    //not finished
    //let returnreGex = new RegExp(`/\\d+{1,3}[`, common, "]*[", n, "]/");
    //console.log(returnreGex);


};


const getXpathsforValue = async (val) => {
    //main function.
    let html = await constructTree();
    let re = matchingRegularExp(val);


    results = finalNodesXpaths.filter((e) => e.value.match(re))
    //console.log({results});

    console.log(html);

};
getXpathsforValue("1 000 000,1");








