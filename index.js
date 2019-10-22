const cheerio = require('cheerio');
const wget = require('wget-improved');
let fs = require('fs');
const _ = require('lodash')


const source = 'http://0.0.0.0:1234/test.html';
outputFile = './output/archive.html';

///helper functions 

const fetchData = () => {
    wget.download(source, outputFile);
};

const readData = () => {
    return data = fs.readFileSync(outputFile, 'utf8').toString('utf8');
}


//create tree with ids and classes if available.
const constructTree = async () => {
    let structure = {};

    await fetchData()
    let string = await readData();
    // console.log("html string for cherio", string);
    const $ = cheerio.load(string)
    $.html();


    const html = $('*').toArray()[0];

    let stringedHTML = (JSON.stringify(recursive(html)));
    let trimmed = stringedHTML.replace(/\"\n"/g, '');

    let final = JSON.parse(trimmed);

    console.log(trimmed);
    //console.log(final.html.values[4].body.values[1].h1.values[0].value);
    

    //get all 
    let allElem = $('*');
    let input = $('#great');

    console.log({input});
    console.log("now this", allElem[7].attribs)



    /*
    _.forEach(allElem[0].children, (es)=>{
        console.log("im ", es.type)
    })


    _.forEach(allElem, (e, i)=>{
        console.log("im index ", i, "and im",e.name, "and i have", e.children.length, "children");

        let type = e.name;
        structure.body= {
            ...structure.body,
            [type] : e.children[0].data || "null"

        };

    })
   
*/
};

constructTree();


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

const recursive=(obj)=>{


    if(obj.type=="tag"){

        const o = {
            [obj.name] : {
                class: obj.attribs.class || "NA",
                id: obj.attribs.id || "NA",
                attributes: obj.attribs || {},
                values:obj.children.map(child=>{       
                    return recursive(child)
                })
            }
        }
        delete o[obj.name].attributes.id;
        delete o[obj.name].attributes.class;
        
        return o;
    }
    if(obj.type=="text"){
        //base case
        return obj.data != "\n" ? {value: obj.data} : obj.data
    }

}



