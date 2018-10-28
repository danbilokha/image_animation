document.addEventListener('DOMContentLoaded', proceedExecution);

function proceedExecution() {
    let baseElem = document.getElementsByClassName('base')[0],
        animationWrapperElem = document.getElementsByClassName('animation__wrapper')[0],
        animationElem = document.getElementsByClassName('animation')[0],
        sectionElem = document.getElementsByClassName('section')[0];

    runAsync(
        changeStyles,
        baseElem,
        sectionElem,
        [
            {'style.height': 'offsetWidth'},
            {'style.height': 'px'}
        ]
    );
}

/*
 Input
    @elem1 - DOMElement: Which styles need to be changed
    @elem2 - DOMElement: Which styles take's
    @styles - Array of objects
        // At first object:
            Key - what should be changed in the elem1
            Value - what should be taken from the elem2
        // At second object:
            Key - additional param to elem1
            Value - additional param value

 Example: Set to elem1 height of elem2 width
        {'style.height': 'offsetWidth'},
        {'style.height': 'px'}
 */
function changeStyles(elem1, elem2, styles) {
    let stylesToSet = styles[0],
        additionalParam = styles[1];

    for (let key in stylesToSet) {
        let baseElem1Styles = key,
            baseElem2Styles = stylesToSet[key],
            baseElem1AdditionalParam = additionalParam[key];

        let {elem: el1, prop: prop1} = getNestedElemProps(elem1, getElemProps(baseElem1Styles)),
            {elem: el2, prop: prop2} = getNestedElemProps(elem2, getElemProps(baseElem2Styles));

        el1[prop1] = el2[prop2] + baseElem1AdditionalParam;
    }

    /*
     Input:
        styles - string: Styles divided by dot ('.')
     */
    function getElemProps(styles) {
        return styles.split('.');
    }

    /*
     Input:
        elem - DOMElement: Element what should be taken
        props - Array: Styles
     */
    function getNestedElemProps(elem, props) {
        let prop = props[0];

        if (props.length === 1) {
            return {elem, prop};
        }

        return getNestedElemProps(elem[prop], props.slice(1));
    }
}

/*
 Input
    @fn - Function: Function, which should be run asynchronously
    @param - Params divided by comma: Any number of params
 */
function runAsync(fn, ...param) {
    setTimeout(() => fn(...param), 0);
}
