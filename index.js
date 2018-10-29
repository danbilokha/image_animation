/*
    polyfill. Please, delete, if already have in your project
 */
window.requestAnimationFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (/* function */ callback, /* DOMElement */ element) {
            window.setTimeout(callback, 1000 / 60);
        };
})();
/*
    ============================================================
 */

document.addEventListener('DOMContentLoaded', proceedExecution);

function proceedExecution() {
    let baseElem = document.getElementsByClassName('base')[0],
        animationWrapperElem = document.getElementsByClassName('animation__wrapper')[0],
        animationElem = document.getElementsByClassName('animation')[0],
        sectionElem = document.getElementsByClassName('section')[0];

    // UNCOMMENT NEXT FUNCTION IF ANIMATION SHOULD PLAY ONLY AT SCROLLING
    /*runAsync(
        changeStyles,
        baseElem,
        sectionElem,
        [
            {'style.height': 'offsetWidth'},
            {'style.height': 'px'}
        ]
    );*/

    animation();
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

/*

 */
function animation() {
    setDefaultAnimationSettings();
    animationRunner();
}

const virtualElements = {},
    ANIMATION_DIRECTION_UP = 1,
    ANIMATION_DIRECTION_DOWN = -1,
    DEFAULT_TRANSLATE_3D_MAX_VALUE = 5,
    // NO CHANGABLE
    PICTURE_DIMENSION_VALUE = 0,
    SHADOW_DIMENSION_VALUE = -1,
    UNIT_TRANSLATE_3D_X = 'vw',
    UNIT_TRANSLATE_3D_Y = 'vh',
    UNIT_TRANSLATE_3D_Z = 'px',
    COUNT_OF_BLOCK_ADDITIONAL_TRACK = 1,
    // MIGHT BE CHANGED IN ORDER TO FIND BEST EXPERIENCE
    // These settings might have impact on performance
    SCROLL_FPS = 1000,
    ANIMATION_TRANSLATE_3D_MOVING = 1,
    DEFAULT_ANIMATION_SCROLL_STEP = 200,
    FIRST_BLOCK_OPACITY = '0.5',
    LAST_BLOCK_OPACITY = '0.5',
    CHANGE_OPACITY_SPEED = 0.1;

let // MIGHT BE CHANGED
    TRANSLATE_3D_MAX_VALUE = DEFAULT_TRANSLATE_3D_MAX_VALUE,
    CALCULATION_SALT = 3,
    ANIMATION_SCROLL_STEP = DEFAULT_ANIMATION_SCROLL_STEP;

function setDefaultAnimationSettings() {
    let blocks = document.getElementsByClassName('block'),
        foundedBlocks = blocks.length;

    for (let i = 0; i < foundedBlocks; i += 1) {
        let blockRowFirst = blocks[i].getElementsByClassName('row-first'),
            foundedRowsFirst = blockRowFirst.length,
            blockRowSecond = blocks[i].getElementsByClassName('row-second'),
            foundedRowsSecond = blockRowSecond.length;

        // set default translate3d synchronously
        setRow(blockRowFirst[0], ANIMATION_DIRECTION_DOWN);
        setRow(blockRowSecond[0], ANIMATION_DIRECTION_UP);

        if (foundedRowsFirst > 1 || blockRowSecond > 1) {
            // set default translate3d asynchronously starting from the second block
            for (let j = 1; j < foundedRowsFirst || foundedRowsSecond; j += 1) {
                runAsync(setRow, blockRowFirst[j], ANIMATION_DIRECTION_DOWN);
                runAsync(setRow, blockRowSecond[j], ANIMATION_DIRECTION_UP);
            }
        }
    }

    function setRow(rowElem, order = ANIMATION_DIRECTION_DOWN) {
        let pictures = rowElem.getElementsByClassName('picture'),
            foundedPicturesLen = pictures.length,
            shadows = rowElem.getElementsByClassName('shadow'),
            //foundedShadowsLen = shadows.length,
            isFloating = (order === ANIMATION_DIRECTION_DOWN) ? -1 : 1;

        // Use foundedPicturesLen here because count of pictures is equal to
        // count of shadows
        for (let i = 0; i < foundedPicturesLen; i += 1) {
            const picture = pictures[i],
                shadow = shadows[i],
                shadow_x = Math.random() * TRANSLATE_3D_MAX_VALUE,
                shadow_y = shadow_x + (Math.random() * CALCULATION_SALT),
                picture_x = (shadow_x + (Math.random() * CALCULATION_SALT)) * isFloating,
                picture_y = (shadow_x + (Math.random() * CALCULATION_SALT)) * isFloating;

            setTranslate3d(
                picture,
                picture_x, //Math.random() * TRANSLATE_3D_MAX_VALUE * isFloating,
                picture_y, //Math.random() * TRANSLATE_3D_MAX_Y_VALUE * isFloating,
                PICTURE_DIMENSION_VALUE
            );
            setUniqueId(picture, picture_x.toString(), picture_y.toString(), PICTURE_DIMENSION_VALUE.toString());

            setTranslate3d(
                shadow,
                shadow_x, //Math.random() * TRANSLATE_3D_MAX_VALUE,
                shadow_y, //Math.random() * TRANSLATE_3D_MAX_Y_VALUE,
                SHADOW_DIMENSION_VALUE
            );
            setUniqueId(shadow, shadow_x.toString(), shadow_y.toString(), SHADOW_DIMENSION_VALUE.toString());

            isFloating *= -1;
        }
    }

    function setTranslate3d(elem, tx, ty, tz) {
        let x = tx + UNIT_TRANSLATE_3D_X,
            y = ty + UNIT_TRANSLATE_3D_Y,
            z = tz + UNIT_TRANSLATE_3D_Z;

        elem.style.transform = `translate3d(${x}, ${y}, ${z})`;
    }
}

function setUniqueId(elem, ...hash) {
    const _hash = hash.join('|');
    elem.id = _hash;
}

function getElemByUniqueId(hash) {
    return document.getElementById(hash);
}

function animationRunner() {
    // DOM ELEMENTS
    const animationSection = document.getElementsByClassName('section')[0],
        blocks = document.getElementsByClassName('block');

    // SIZES
    const innerClientWidth = window.innerWidth,
        blockWidth = blocks[0].offsetWidth,
        animationSectionWidth = animationSection.offsetWidth,
        animationToBeScrolled = animationSectionWidth - innerClientWidth;

    // ANIMATION CALCULATIONS
    const blocksToBeFittedInWindow = innerClientWidth / blockWidth,
        numberOfTrackedBlockSimultaneously = Math.round(blocksToBeFittedInWindow + COUNT_OF_BLOCK_ADDITIONAL_TRACK);

    let visibleBlocksIndexes = setStartTrackBlocks(numberOfTrackedBlockSimultaneously);
    setStartBlockOpacity(blocks, visibleBlocksIndexes);

    // SYSTEM ANIMATION
    const SCROLL_DIRECTION_RIGHT = 1,
        SCROLL_DIRECTION_LEFT = -1,
        ANIMATION_DEFAULT_SCROLLED = 0,
        elementPositions = {};

    // SYSTEM ANIMATION SETTINGS
    let animationStart = new Date(),
        animationPrevTime = animationStart,
        isFirstAnimationRun = true;

    let animationScrolled = ANIMATION_DEFAULT_SCROLLED,
        scrollDirection = SCROLL_DIRECTION_LEFT;

    let animationLoopHandler;

    function setStartTrackBlocks(numberOfTrackedBlockSimultaneously) {
        let result = [];

        for (let i = 0, len = numberOfTrackedBlockSimultaneously; i < len; i += 1) {
            result.push(i);
        }

        return result;
    }

    function setStartBlockOpacity(blocks, visibleBlocksIndexes) {
        blocks[visibleBlocksIndexes[0]].style.opacity = FIRST_BLOCK_OPACITY;
    }

    function updateTrackBlocks(blocks, currentTracked, animationScrolled) {
        let currentTrackedBlocks = [...currentTracked];

        const firstTrackBlock = currentTrackedBlocks.splice(0, 1)[0],
            lastTrackBlock = currentTrackedBlocks.splice(-1, 1)[0];

        const firstBlockX = blocks[firstTrackBlock].getBoundingClientRect().x,
            lastBlockX = blocks[lastTrackBlock].getBoundingClientRect().x;

        console.log(animationScrolled / blockWidth, Math.floor(animationScrolled / blockWidth));

        // TODO: CHECK IT OUT - BUGS!
        if ((Math.abs(firstBlockX) - blockWidth) > blockWidth) {
            const nextBlockIndex = lastTrackBlock + 1;

            if (!blocks[nextBlockIndex]) { // NO changes - no more block left
                return [firstTrackBlock, ...currentTrackedBlocks, lastTrackBlock];
            }

            return [...currentTrackedBlocks, lastTrackBlock, nextBlockIndex];
        }

        // TODO: NEED TO CHANGE
        if (Math.abs(lastBlockX) > (blockWidth * numberOfTrackedBlockSimultaneously - blockWidth)) {
            const prevBlockIndex = firstTrackBlock - 1;

            if (!blocks[prevBlockIndex]) { // NO changes - no more block left
                return [firstTrackBlock, ...currentTrackedBlocks, lastTrackBlock];
            }

            return [prevBlockIndex, firstTrackBlock, ...currentTrackedBlocks];
        }

        return currentTracked;
    }

    function updatedBlockOpacity(blocks, visibleBlocks, animationDirection) {
        const firstVisibleBlock = visibleBlocks[0];

        if (animationDirection === ANIMATION_DIRECTION_DOWN) {
            const currentOpacityFirstBlock = +blocks[firstVisibleBlock].style.opacity;
            let updatedOpacityFirstBlock = currentOpacityFirstBlock - CHANGE_OPACITY_SPEED;

            if (updatedOpacityFirstBlock < 0) {
                updatedOpacityFirstBlock = 0;
            }

            blocks[firstVisibleBlock].style.opacity = `${updatedOpacityFirstBlock}`;
        }

        if (animationDirection === ANIMATION_DIRECTION_UP) {
            const currentOpacityFirstBlock = +blocks[firstVisibleBlock].style.opacity;
            let updatedOpacityFirstBlock = currentOpacityFirstBlock + CHANGE_OPACITY_SPEED;

            if (updatedOpacityFirstBlock > FIRST_BLOCK_OPACITY) {
                updatedOpacityFirstBlock = FIRST_BLOCK_OPACITY;
            }

            blocks[firstVisibleBlock].style.opacity = `${updatedOpacityFirstBlock}`;
        }
    }

    function proceedAnimation() {
        const animationCurrentTime = new Date(),
            fps = animationCurrentTime - animationPrevTime;
        // In order do not proceed animation too often
        if (fps < SCROLL_FPS && !isFirstAnimationRun) {
            animationLoopHandler = requestAnimationFrame(proceedAnimation);
            return;
        } else {
            isFirstAnimationRun = false;
        }

        /*
            Proceed animation
         */
        // ANIMATE section moving
        const sectionAfterScroll = animationScrolled + (ANIMATION_SCROLL_STEP * scrollDirection);
        animationSection.style.left = sectionAfterScroll + 'px';

        animationScrolled = sectionAfterScroll;

        animatePicturesMoving(blocks, visibleBlocksIndexes, scrollDirection);

        visibleBlocksIndexes = updateTrackBlocks(blocks, visibleBlocksIndexes, animationScrolled);
        updatedBlockOpacity(blocks, visibleBlocksIndexes, scrollDirection);
        console.log(visibleBlocksIndexes);

        // ANIMATION SCROLL DIRECTION
        if (
            Math.abs(animationScrolled) > animationToBeScrolled
            || animationScrolled === ANIMATION_DEFAULT_SCROLLED
        ) {
            //console.info('animation direction scroll finished. Change direction');
            scrollDirection = scrollDirection === SCROLL_DIRECTION_LEFT
                ? SCROLL_DIRECTION_RIGHT
                : SCROLL_DIRECTION_LEFT;
        }
        /*
            Finish animation
         */
        animationPrevTime = new Date();
        animationLoopHandler = requestAnimationFrame(proceedAnimation);
    }

    function animatePicturesMoving(blocks, trackedBlocksIndexes, direction) {
        trackedBlocksIndexes.forEach((index) => {
            const blockPictures = blocks[index].getElementsByClassName('picture'),
                blockPicturesLen = blockPictures.length,
                blockShadows = blocks[index].getElementsByClassName('shadow'),
                blockShadowsLen = blockShadows.length;

            // SET PICTURES
            for (let i = 0; i < blockPicturesLen; i += 1) {
                const sign = i % 2 === 0 ? 1 : -1;
                animateElementTranslate3d(blockPictures[i], direction, sign);
            }

            // SET SHADOW
            for (let i = 0; i < blockShadowsLen; i += 1) {
                const sign = i % 2 === 0 ? 1 : -1;
                animateElementTranslate3d(blockShadows[i], direction, sign);
            }

            // BLOCK OPACITY
        });

        function animateElementTranslate3d(elem, direction, sign) {
            const _elem = elem,
                elemId = _elem.id;

            if (direction === ANIMATION_DIRECTION_UP) {
                const {x: xPic, y: yPic, z: zPic} = getTranslate3dValues(_elem.style.transform);
                let {x: xPicNew, y: yPicNew, z: zPicNew} = getElemCoordinatesFromHistory(elemId);

                if (xPicNew === undefined || yPicNew === undefined || zPicNew === undefined) {
                    xPicNew = (+xPic + ANIMATION_TRANSLATE_3D_MOVING * direction * sign);
                    yPicNew = (+yPic + ANIMATION_TRANSLATE_3D_MOVING * direction * sign);
                    zPicNew = zPic;
                }

                _elem.style.transform = `translate3d(
                ${xPicNew}${UNIT_TRANSLATE_3D_X}, 
                ${yPicNew}${UNIT_TRANSLATE_3D_Y}, 
                ${zPicNew}${UNIT_TRANSLATE_3D_Z}
                )`;

                return;
            }

            const {x: xPic, y: yPic, z: zPic} = getTranslate3dValues(_elem.style.transform);
            const xPicNew = (+xPic + ANIMATION_TRANSLATE_3D_MOVING * direction * sign),
                yPicNew = (+yPic + ANIMATION_TRANSLATE_3D_MOVING * direction * sign),
                zPicNew = zPic;

            _elem.style.transform = `translate3d(
            ${xPicNew}${UNIT_TRANSLATE_3D_X}, 
            ${yPicNew}${UNIT_TRANSLATE_3D_Y}, 
            ${zPicNew}${UNIT_TRANSLATE_3D_Z}
            )`;

            trackElemCoordinatesHistory(elemId, xPicNew, yPicNew, zPicNew);
        }

        function trackElemCoordinatesHistory(elemId, x, y, z) {
            if (!elementPositions[elemId]) {
                elementPositions[elemId] = [];
            }

            elementPositions[elemId].push({x, y, z});
        }

        function getElemCoordinatesFromHistory(elemId) {
            const lastPos = (!!elementPositions[elemId])
                ? elementPositions[elemId].pop()
                : undefined;

            if (!lastPos) {
                return {x: undefined, y: undefined, z: undefined};
            }

            return {x: lastPos.x, y: lastPos.y, z: lastPos.z};
        }
    }

    // Start first automatic animation
    animationLoopHandler = requestAnimationFrame(proceedAnimation);

    /*
        USER INTERACTING WITH WEB PAGE
     */
    function userScrollHandlerAction() {
        let timeOutId,
            userPrevTop = (window.pageYOffset !== undefined)
                ? window.pageYOffset
                : (document.documentElement || document.body.parentNode || document.body).scrollTop;

        function userScrolling() {
            const userCurrTop = (window.pageYOffset !== undefined)
                ? window.pageYOffset
                : (document.documentElement || document.body.parentNode || document.body).scrollTop;

            // CLEAR PREV ANIMATION RUNNERS
            clearTimeout(timeOutId);
            window.cancelAnimationFrame(animationLoopHandler);

            TRANSLATE_3D_MAX_VALUE = 15;
            ANIMATION_SCROLL_STEP = 400;
            if (userCurrTop < userPrevTop) {
                console.log('up'); // TODO: DEL
                scrollDirection = ANIMATION_DIRECTION_UP;
                proceedAnimation();
            } else {
                console.log('down'); // TODO: DEL
                scrollDirection = ANIMATION_DIRECTION_DOWN;
                proceedAnimation();
            }
            userPrevTop = userCurrTop;

            timeOutId = setTimeout(() => {
                TRANSLATE_3D_MAX_VALUE = DEFAULT_TRANSLATE_3D_MAX_VALUE;
                ANIMATION_SCROLL_STEP = DEFAULT_ANIMATION_SCROLL_STEP;
                animationLoopHandler = requestAnimationFrame(proceedAnimation);
            }, 1500);
        }

        window.addEventListener('scroll', userScrolling);
    }

    //userScrollHandlerAction();
}

function getTranslate3dValues(cssTextStyleValue) {
    const cssText = cssTextStyleValue.split(','),
        x = cssText[0].split('(')[1].slice(0, -2),
        y = cssText[1].slice(0, -2),
        z = cssText[2].slice(0, -3);

    return {x, y, z};
}
