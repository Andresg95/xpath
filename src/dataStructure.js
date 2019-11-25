const fs = require('fs');
const cheerio = require('cheerio');
const _ = require('lodash');



const outputFile = './output/archive.html';

const { valuesCleanUps, matchingRegularExp } = require('./regexGenerator');
const { fetchData, readData } = require('./urlHandler');

const getXpathsforValue = async (val, source) => {
    //main function.
    let data = await constructTree(source);
    let html = data[0];
    let finalNodesXpaths = data[1];
    let results = valuesCleanUps(matchingRegularExp(val), finalNodesXpaths)


    console.log({
        countResults: results.length
    },
        // { results }
    );

    return {
        html,
        results
    }
};


const constructTree = async (source) => {


    let finalNodesXpaths = [];

    fs.writeFileSync(outputFile, await fetchData(source));
    const $ = cheerio.load(await readData(outputFile))
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

}


const getByAlias = (arr, alias) => {
    return arr.filter((e) => e.alias == alias)[0];
}


const getById = (arr, id) => {
    return arr.filter((e) => e.idValue == id)[0];
}

const getByClassname = (arr, Class) => {
    //possible not unique
    return arr.filter((e) => e.classValues == Class)[0];

}

const getByAttributes = (arr, attributes) => {
    //possible not unique
    return arr.filter(e =>((e.attributesValues == attributes)))[0];
}



module.exports = {
    constructTree,
    getXpathsforValue,
    getByAlias,
    getById,
    getByAttributes,
    getByClassname
}