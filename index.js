const cheerio = require('cheerio');
//const wget = require('wget-improved');
let fs = require('fs');
const axios = require('axios')
const _ = require('lodash')


const source = "http://0.0.0.0:1234/test1.html";
outputFile = './output/archive.html';
let finalNodesXpaths = [];


///helper functions 
const fetchData = async () => {

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

    fs.writeFileSync(outputFile, await fetchData());
    const $ = cheerio.load(await readData())
    $.html();
    const html = $('*').toArray()[0];
    return (recursive(html, "", []));
};



const matchingRegularExp = (number) => {

    //si tienen diferente signos o un unico separador no hay problema
    let numerals = new RegExp(/\d{1,100}[,.'\s]+/, "g"); //for numbers  
    let groups = number.toString().match(numerals);

    if (groups.length == 1) {

        let decimalSeparator = groups[0].charAt(groups[0].length - 1) != " " ? `\\${groups[0].charAt(groups[0].length - 1)}` : "\\s";
        console.log({ decimalSeparator });
        let numGroups = RegExp(decimalSeparator, "g");
        let decimalLength = number.toString().split(numGroups)[1].length
        let wholeRegex = `(\\+\\-)?(\\d{1,100}${decimalSeparator})(\\d{0,${decimalLength}})`
        console.log({ wholeRegex })
        return new RegExp(wholeRegex, "gm")

    };
    console.log({ groups });
    let lastGroup = groups[groups.length - 1]; //the last symbol used
    let n = `\\${lastGroup.charAt(lastGroup.length - 1)}`
    let firstGroup = groups[0];
    let common = firstGroup.charAt(firstGroup.length - 1) != " " ? `\\${firstGroup.charAt(firstGroup.length - 1)}` : "\\s"
    console.log("the common separator is ", { common });
    //devuelve 2 grupos, los enteros y los decimales separados por el separator
    let numGroups = RegExp(n, "g");
    let decimalLength = number.toString().split(numGroups)[1].length
    let wholeNs = number.toString().split(numGroups)[0]

    console.log({ wholeNs }, { decimalLength });
    let wholeRegex = `(\\d{1,3}${common})+(\\d{1,3}${n})?(\\d{0,${decimalLength}})?`
    return new RegExp(wholeRegex, "gm");

};





const getXpathsforValue = async (val) => {
    //main function.
    let html = await constructTree();
    let results = valuesCleanUps(matchingRegularExp(val))


    console.log({
        countResults: results.length

    },
        { results });
    //console.log(html);
};


const valuesCleanUps = (re) => {

    let results = finalNodesXpaths.filter((e) => e.value.match(re))
    return results.map(item => {

        let value = item.value.replace(/[^\d\\.-\\+,\\']/g, '');
        let { xpath } = item;
        return {
            value,
            xpath
        }
    })
};



const recurrentExecution = (html, alias) => {


    //make sure to remove finalNoesXpath global var prop.
    let count = 0;
    const intervalObject = setInterval(()=>{
        count++;
        console.log(count, "seconds passed");
        if(count%5==0){
            console.log('exiting');
            getXpathsforValue("0,41");
        }

        if (count==20){
            clearInterval(intervalObject)
        }

    }, 1000)
};

recurrentExecution();







