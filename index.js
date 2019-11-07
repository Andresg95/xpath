const cheerio = require('cheerio');
//const wget = require('wget-improved');
let fs = require('fs');
const axios = require('axios')
const _ = require('lodash')


const source = "http://0.0.0.0:1234/test1.html";
outputFile = './output/archive.html';


///helper functions 
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


const readData = () => {
    return data = fs.readFileSync(outputFile, 'utf8').toString('utf8');
};


//create tree with ids and classes if available.
const constructTree = async (source) => {

    let finalNodesXpaths = [];

    fs.writeFileSync(outputFile, await fetchData(source));
    const $ = cheerio.load(await readData())
    $.html();
    const html = $('*').toArray()[0];

    const recursive = (obj, parent, base) => {

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
                        return recursive(child, `${currentParent}.values[${index}]`, currentParent)
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
                xpath: `${parent}.value`,
                class: `${base}.class`,
                attributes: `${base}.attributes`,
                id: `${base}.id`,
            })

            return obj.data != "\\n" ? { value: obj.data } : obj.data
        }
    }

    return [(recursive(html, "", [])), finalNodesXpaths];
};



const matchingRegularExp = (number) => {

    //si tienen diferente signos o un unico separador no hay problema
    let numerals = new RegExp(/\d{1,100}[,.'\s]+/, "g"); //for numbers  
    let groups = number.toString().match(numerals);

    if (groups.length == 1) {

        let decimalSeparator = groups[0].charAt(groups[0].length - 1) != " " ? `\\${groups[0].charAt(groups[0].length - 1)}` : "\\s";
       // console.log({ decimalSeparator });
        let numGroups = RegExp(decimalSeparator, "g");
        let decimalLength = number.toString().split(numGroups)[1].length
        let wholeRegex = `(\\+\\-)?(\\d{1,100}${decimalSeparator})(\\d{0,${decimalLength}})`
        //console.log({ wholeRegex })
        return new RegExp(wholeRegex, "gm")

    };
    //console.log({ groups });
    let lastGroup = groups[groups.length - 1]; //the last symbol used
    let n = `\\${lastGroup.charAt(lastGroup.length - 1)}`
    let firstGroup = groups[0];
    let common = firstGroup.charAt(firstGroup.length - 1) != " " ? `\\${firstGroup.charAt(firstGroup.length - 1)}` : "\\s"
    //console.log("the common separator is ", { common });
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
    let data = await constructTree(source);
    let html = data[0];
    let finalNodesXpaths = data[1];
    let results = valuesCleanUps(matchingRegularExp(val), finalNodesXpaths)
    

   
    // console.log({
    //     countResults: results.length
    // },
    //     { results });

    return {
        html,
        results
    }
};


const valuesCleanUps = (re, finalNodesXpaths) => {


    let results = finalNodesXpaths.filter((e) => e.value.match(re))
    return results.map(item => {

        let value = item.value.replace(/[^\\d\\.-\\+,\\']/g, '');
        let { xpath, attributes, id, class: Class } = item;
        return {
            value,
            xpath,
            attributes,
            id,
            Class
        }
    })
};




const main = async () => {

    let { html,
        results,
    } = await getXpathsforValue("100.000,56");
    //set up aarray with aliases [{xpath, alias}]
    let myalias = results.map((res)=>{return {
        alias: "Myvalue",
        value: res.value,
        xpath: res.xpath,
        id: res.id,
        Class: res.Class,
        attributes: res.attributes
    }});
    recurrentExecution(source, myalias, html)
    
}

main();

const recurrentExecution = async (source, results, html) => {
    
    //we have current html object, nodevalues with xpath, and results.
    //take xpath, from results.

    //console.log("in recurrent",{source}, {results}, {html});

    
    let count = 0;
    const intervalObject = setInterval(async () => {
        count++;
        console.log(count, "seconds passed");
        if (count % 5 == 0) {
            //in case on new scrap
            //getXpathsforValue("0,41")

            let alias ="Myvalue";
            let spxpath = results.filter((o)=>o.alias==alias)[0];
            let foundByxpath= (!_.isUndefined((_.get(html, spxpath.xpath))) ? true : false);
           
            //possible switch (found xpath, found class id attributes, NOT found)

            if(foundByxpath){

                let updatedDAta = {
                    valueInPage: _.get(html, spxpath.xpath), //value obtained in html
                    alias: spxpath.alias,
                    storedValue: spxpath.value, //cleaned stored value
                    id: _.get(html, spxpath.id),
                    Class:  _.get(html, spxpath.Class),
                    attributes: _.get(html, spxpath.attributes)
                }
                console.log({updatedDAta});
                                   

            }else{

                //try look for id, classes or attributes.


                console.log({results})
                console.log("finito");
                
                // let updatedDAta = {
                //     valueInPage: _.get(html, spxpath.xpath), //value obtained in html
                //     alias: spxpath.alias,
                //     storedValue: spxpath.value, //cleaned stored value
                //     id: _.get(html, spxpath.id),
                //     Class:  _.get(html, spxpath.Class),
                //     attributes: _.get(html, spxpath.attributes)
                // 


            }

                    
            //relear la pagina (analyze class, id, attributes.)
            /*
            //releer la pagina
                let HTML =  await fetchData(source);
                const $ = cheerio.load(HTML)
                $.html();
                const html = $('*').toArray()[0];
               // console.log("ngaa", {html})
                //getbackrecursive
               // let data = constructTree(source);
                //[(recursive(html, "", [])), finalNodesXpaths];       
        
            console.log({sec});
        
            //values for first coincidence:
            let second = {
                value: _.get(HTML, results[0].xpath),
                id: _.get(HTML, results[0].id),
                class: _.get(HTML, results[0].Class),
                attributes: _.get(HTML, results[0].attributes)
            }

            console.log("new page, same stored paths",{second});
            */
        }

        if (count == 20) {
            clearInterval(intervalObject)
        }

    }, 1000)
};








