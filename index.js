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

    //get all 
    let input = $('#algo');
    //console.log(input);   
    //console.log($('li').next());
    //console.log($.root().html());

    let allElem = $('*');

    //console.log("thttt", allElem[7].children)

    _.forEach(allElem[7].children, (es)=>{
        console.log("im ", es.type)
    })

    console.log("recursive", recursiveChildCheck(allElem[2].children))

    _.forEach(allElem, (e, i)=>{
        console.log("im index ", i, "and im",e.name, "and i have", e.children.length, "children")
        let children = {};
        // e.children.forEach(child=>{

            //recursive function
            //break point:
            //if childs are not tag type.
            // let flag = true;

            // children.forEach(child => {
            //     if(_.isEqual(child.type, "tag")){
            //         flag = false;
            //     }
            // });



            // if(_.isEqual(child.type, "tag")){
            //     let type = child.type;
            //     children={
            //         ...children,
            //         [type] : e.children[0].data || "null"
            //     }   
            // }

        // })

        let type = e.name;
        structure.body= {
            ...structure.body,
            [type] : e.children[0].data || "null"

        };

    })
    console.log(structure);

  

};

const recursiveChildCheck = (childs, structure) => {

    // having {
    //     body: {}
    // }

    let children = childs;
    let mycurrentS = structure;

    let currentTags = children.filter(e=> _.isEqual(e.type, "tag"))

    //base case (no more tags inside, just text)
    if (currentTags.length == 0){
        //chldren has text elements 

        //pass in the structure ?
            return {
                value: children[0].data || "null",
                attributes : children[0].att || "null",
                id: children[0].type || "NA",
                class: "NA"
             }
    }
   
    if(currentTags.length > 0){

        return (children, {
            // new structure. structure 
        })

    }
}



constructTree();



