//imports
const { getXpathsforValue, getByAlias, getById, getByAttributes, getByClassname } = require('./src/dataStructure');
const _ = require('lodash');

const source = "http://0.0.0.0:1234/test1.html";
const valueToSearch = "100.123,32";


const main = async () => {

    let { html,
        results,
    } = await getXpathsforValue(valueToSearch, source);

    //set up for alias and once we have them we start recurrent Execution
    //set up aarray with aliases [{xpath, alias}]
    let myalias = results.map((res, index) => {
        return {
            alias: "Myvalue".concat(index.toString()),
            value: res.value,
            xpath: res.xpath,
            id: res.id,
            idValue: _.get(html, res.id),
            Class: res.Class,
            classValues: _.get(html, res.Class),
            attributes: res.attributes,
            attributesValues: _.get(html, res.attributes)
        }
    });
    recurrentExecution(source, myalias, html);
}

main();



const recurrentExecution = async (source, results, html) => {


    //make my own getBY id method.
    //we have current html object, nodevalues with xpath, and results.
    //take xpath, from results.
    //console.log("in recurrent",{source}, {results}, {html});
    //console.log({results});

    let count = 0;
    const intervalObject = setInterval(async () => {
        count++;
        console.log(count, "seconds passed");
        if (count % 5 == 0) {
            //in case on new scrap
            //filter with alias to get selected value.
            let alias = "Myvalue1";
            let idValue = _.get(html, results[1].id)
            let className = _.get(html, results[1].Class)
            let myattributes = _.get(html, results[1].attributes)

            // let spxpath = getByAlias(results, alias);
            // console.log("back after alias search," , {spxpath});
            
            
            //TRY to relocate.... with these functions 

            // let spxpath = getById(results, "waths");
            // console.log("back in main" , {spxpath})            
            
            // let spxpath = getByClassname(results, className);
            // console.log({spxpath});
        
            //let spxpath = getByAttributes(results, myattributes);
            //console.log({spxpath});

            let spxpath = results.filter((o) => o.alias == alias || o.idValue == idValue || o.classValues == className)[0];

            let { html: _html,
                results: _results,
            } = await getXpathsforValue(valueToSearch, source);

            let foundByxpath = (!_.isUndefined((_.get(_html, spxpath.xpath))) ? true : false);

            //possible switch (found xpath, found class id attributes, NOT found)
            //if it has id
            //if it has class,
            //if it has any otherAttributes

            if (foundByxpath) {

                let updatedDAta = {
                    valueInPage: _.get(_html, spxpath.xpath), //value obtained in html
                    alias: spxpath.alias,
                    storedValue: spxpath.value, //cleaned stored value
                    id: _.get(_html, spxpath.id),
                    Class: _.get(_html, spxpath.Class),
                    attributes: _.get(_html, spxpath.attributes)
                }
                console.log({ test : updatedDAta.attributes.localizer });
            } else {

                let _newResults = _results.map((res) => {
                    return {
                        alias: "Myvalue",
                        value: res.value,
                        xpath: res.xpath,
                        id: res.id,
                        idValue: _.get(_html, res.id),
                        Class: res.Class,
                        clasValues: _.get(_html, res.Class),
                        attributes: res.attributes,
                        attributesValues: _.get(_html, res.attributes)
                    }
                });

                //try look for id, classes or attributes.
                console.log("Se ha cambiado la estructura de la pagina...., será este tu resultado?");
                let idValue = _.get(_html, _results[1].id)

                console.log({ idValue });
                console.log("nuevos results:", { _newResults });

                let newLocationNode = _newResults.filter((o) => o.idValue == idValue)[0];
                console.log({ newLocationNode });
                //console.log({_results});


                let relocatedDAta = {
                    valueInPage: _.get(_html, newLocationNode.xpath), //value obtained in html
                    alias: newLocationNode.alias,
                    storedValue: newLocationNode.value, //cleaned stored value
                    id: _.get(_html, newLocationNode.id),
                    Class: _.get(_html, newLocationNode.Class),
                    attributes: _.get(_html, newLocationNode.attributes)
                }

                console.log({ relocatedDAta })

                // let updatedDAta = {
                //     valueInPage: _.get(html, spxpath.xpath), //value obtained in html
                //     alias: spxpath.alias,
                //     storedValue: spxpath.value, //cleaned stored value
                //     id: _.get(html, spxpath.id),
                //     Class:  _.get(html, spxpath.Class),
                //     attributes: _.get(html, spxpath.attributes)

            }

            //relear la pagina (analyze class, id, attributes.)
            /*
            //releer la pagina
              
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








