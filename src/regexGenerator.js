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


const matchingRegularExp = (number) => {

    //si tienen diferente signos o un unico separador no hay problema
    let numerals = new RegExp(/\d{1,100}[,.'\s]+/, "g"); //for numbers  
    let groups = number.toString().match(numerals);

    if (groups.length == 1) {

        let decimalSeparator = groups[0].charAt(groups[0].length - 1) != " " ? `\\${groups[0].charAt(groups[0].length - 1)}` : "\\s";
       // console.log({ decimalSeparator });
        let numGroups = RegExp(decimalSeparator, "g");
        let decimalLength = number.toString().split(numGroups)[1].length
        let wholeRegex = `(\\+\\-)?(\\d{1,100}${decimalSeparator})(\\d{${decimalLength}})`
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


module.exports = {
    valuesCleanUps,
    matchingRegularExp

}