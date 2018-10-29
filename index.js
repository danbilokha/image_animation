'use strict';

(function () {
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
                                CODE
        ============================================================
     */

    let cancelAnimationFrameCallback,
        proceedAnimationFn;

    document.addEventListener('DOMContentLoaded', run);
    window.addEventListener('resize', run);

    /*
        ============================================================
                                CHANGEABLE OPTIONS
        ============================================================
     */
    // NO CHANGABLE
    const ANIMATION_DIRECTION_UP = 1,
        ANIMATION_DIRECTION_DOWN = -1,
        DEFAULT_TRANSLATE_3D_MAX_VALUE = 5,
        SCROLL_DIRECTION_RIGHT = 1,
        SCROLL_DIRECTION_LEFT = -1,
        ANIMATION_DEFAULT_SCROLLED = 0,
        // NO CHANGABLE
        PICTURE_DIMENSION_VALUE = 0,
        SHADOW_DIMENSION_VALUE = -1,
        UNIT_TRANSLATE_3D_X = 'vw',
        UNIT_TRANSLATE_3D_Y = 'vh',
        UNIT_TRANSLATE_3D_Z = 'px',
        COUNT_OF_BLOCK_ADDITIONAL_TRACK = 1,
        NO_OPACITY = 0,
        FULL_OPACITY = 1,
        // MIGHT BE CHANGED IN ORDER TO FIND BEST EXPERIENCE
        // These settings might have impact on performance
        SCROLL_FPS = 1000,
        ANIMATION_TRANSLATE_3D_MOVING = 1,
        DEFAULT_ANIMATION_SCROLL_STEP = 200,
        // OPTION: opacity - BETTER not change
        DEFAULT_FIRST_BLOCK_OPACITY = '0.5',
        DEFAULT_SECOND_BLOCK_OPACITY = '0.9',
        FIRST_BLOCK_OPACITY = DEFAULT_FIRST_BLOCK_OPACITY,
        SECOND_BLOCK_OPACITY = DEFAULT_SECOND_BLOCK_OPACITY,
        CHANGE_OPACITY_SPEED = 0.15,
        CHANGE_OPACITY_SPEED_INCREASED = 0.25;

    /*
        ============================================================
                                NOT CHANGEABLE OPTIONS
        ============================================================
     */
    let TRANSLATE_3D_MAX_VALUE = DEFAULT_TRANSLATE_3D_MAX_VALUE,
        CALCULATION_SALT = 3,
        ANIMATION_SCROLL_STEP = DEFAULT_ANIMATION_SCROLL_STEP;

    function run() {
        if (!!cancelAnimationFrameCallback) {
            window.cancelAnimationFrame(cancelAnimationFrameCallback);
        }

        window.removeEventListener('scroll', userScrolling);

        proceedExecution();
    }

    function proceedExecution() {
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
        window.addEventListener('scroll', userScrolling);
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
    }

    function setUniqueId(elem, ...hash) {
        const _hash = hash.join('|');
        elem.id = _hash;

        return _hash;
    }

    function getTranslate3dValues(cssTextStyleValue) {
        const cssText = cssTextStyleValue.split(','),
            x = cssText[0].split('(')[1].slice(0, -2),
            y = cssText[1].slice(0, -2),
            z = cssText[2].slice(0, -3);

        return {x, y, z};
    }

    function setTranslate3d(elem, tx, ty, tz) {
        let x = tx + UNIT_TRANSLATE_3D_X,
            y = ty + UNIT_TRANSLATE_3D_Y,
            z = tz + UNIT_TRANSLATE_3D_Z;

        elem.style.transform = `translate3d(${x}, ${y}, ${z})`;
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

    /*
     Input
        @fn - Function: Function, which should be run asynchronously
        @param - Params divided by comma: Any number of params
     */
    function runAsync(fn, ...param) {
        setTimeout(() => fn(...param), 0);
    }

    /*
        Animation state variables
     */
    const defaultElementsPositions = {};
    let scrollDirection = SCROLL_DIRECTION_LEFT;

    function animation() {
        setDefaultAnimationSettings();
        animationRunner();
    }

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
                    picture_x,
                    picture_y,
                    PICTURE_DIMENSION_VALUE
                );
                const pictureUniqueId = setUniqueId(
                    picture, picture_x.toString(), picture_y.toString(), PICTURE_DIMENSION_VALUE.toString()
                );
                saveInitialAnimationSettings(pictureUniqueId, picture_x, picture_y, PICTURE_DIMENSION_VALUE);

                setTranslate3d(
                    shadow,
                    shadow_x,
                    shadow_y,
                    SHADOW_DIMENSION_VALUE
                );
                const shadowUniqueId = setUniqueId(
                    shadow, shadow_x.toString(), shadow_y.toString(), SHADOW_DIMENSION_VALUE.toString()
                );
                saveInitialAnimationSettings(shadowUniqueId, shadow_x, shadow_y, SHADOW_DIMENSION_VALUE);

                isFloating *= -1;
            }
        }
    }

    function saveInitialAnimationSettings(elementUniqueId, x, y, z) {
        defaultElementsPositions[elementUniqueId] = {x, y, z};
    }

    function restoreInitialAnimationSettings() {
        for (let elemId in defaultElementsPositions) {
            const elem = document.getElementById(elemId);
            setTranslate3d(
                elem,
                defaultElementsPositions[elemId].x,
                defaultElementsPositions[elemId].y,
                defaultElementsPositions[elemId].z,
            );
        }
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

        let visibleBlocksIndexes = setInitialBlocksTrackList(numberOfTrackedBlockSimultaneously);
        setInitialBlocksOpacity(blocks, visibleBlocksIndexes);

        // SYSTEM ANIMATION
        const elementPositions = {};

        // SYSTEM ANIMATION SETTINGS
        let animationStart = new Date(),
            animationPrevTime = animationStart,
            isFirstAnimationRun = true;

        let animationScrolled = ANIMATION_DEFAULT_SCROLLED,
            animationSectionScrolledMaxTracking = 0,
            animationBlockScrolledTracking = -100;

        function setInitialBlocksTrackList(numberOfTrackedBlockSimultaneously) {
            let result = [];

            for (let i = 0, len = numberOfTrackedBlockSimultaneously; i < len; i += 1) {
                result.push(i);
            }

            return result;
        }

        function setInitialBlocksOpacity(blocks, visibleBlocksIndexes) {
            blocks[visibleBlocksIndexes[0]].style.opacity = FIRST_BLOCK_OPACITY;
            blocks[visibleBlocksIndexes[1]].style.opacity = SECOND_BLOCK_OPACITY;
        }

        function updateBlocksTrackList(blocks, currentTrackedBlocks, animationSectionScrolled, animationSectionScrollDirection) {
            let _currentTrackedBlocks = [...currentTrackedBlocks],
                _animationSectionScrolled = Math.abs(animationSectionScrolled),
                _sizeSectionScrolledTo = 0;

            if (animationSectionScrollDirection === ANIMATION_DIRECTION_DOWN) {
                animationSectionScrolledMaxTracking = (animationSectionScrolledMaxTracking > _animationSectionScrolled)
                    ? animationSectionScrolledMaxTracking
                    : _animationSectionScrolled;

                _sizeSectionScrolledTo = _animationSectionScrolled;
            }

            if (animationSectionScrollDirection === ANIMATION_DIRECTION_UP) {
                _sizeSectionScrolledTo = animationSectionScrolledMaxTracking - _animationSectionScrolled;
            }

            const blockScrolled = Math.floor(_sizeSectionScrolledTo / blockWidth) - 1;
            if (blockScrolled <= 0 || blockScrolled === animationBlockScrolledTracking) {
                return [..._currentTrackedBlocks];
            }
            animationBlockScrolledTracking = blockScrolled;

            const scrollNormalized = animationSectionScrollDirection * -1,
                firstTracked = _currentTrackedBlocks[0],
                lastTracked = _currentTrackedBlocks[_currentTrackedBlocks.length - 1];

            // Check IF first and last future elements exist
            if (!blocks[firstTracked + scrollNormalized] || !blocks[lastTracked + scrollNormalized]) {
                return [..._currentTrackedBlocks];
            }

            return _currentTrackedBlocks.map(index => index + scrollNormalized);
        }

        // TODO: Get rid of
        let opacityHelper_TrackedPrevBlocks = [];
        // TODO: Improve
        function updatedBlocksOpacity(blocks, currentTrackedBlocks, animationSectionScrollDirection) {
            // ELEMENT, which no longer seeing
            if(!!opacityHelper_TrackedPrevBlocks[0] && opacityHelper_TrackedPrevBlocks[0] !== currentTrackedBlocks[0]) {
                blocks[opacityHelper_TrackedPrevBlocks[0]].style.opacity = NO_OPACITY;
            }

            const firstVisibleBlock = currentTrackedBlocks[0],
                currentFirstBlockOpacity = +blocks[firstVisibleBlock].style.opacity,
                secondVisibleBlock = currentTrackedBlocks[1],
                currentSecondBlockOpacity = +blocks[secondVisibleBlock].style.opacity;

            let updatedFirstBlockOpacity = 0,
                updatedSecondBlockOpacity = 0;

            // TODO: Rewrite
            if (animationSectionScrollDirection === ANIMATION_DIRECTION_DOWN) {
                if(currentFirstBlockOpacity === FULL_OPACITY && currentSecondBlockOpacity === FULL_OPACITY) {
                    updatedFirstBlockOpacity = FIRST_BLOCK_OPACITY - CHANGE_OPACITY_SPEED_INCREASED;
                    updatedSecondBlockOpacity = SECOND_BLOCK_OPACITY - CHANGE_OPACITY_SPEED;
                } else {
                    updatedFirstBlockOpacity = currentFirstBlockOpacity - CHANGE_OPACITY_SPEED_INCREASED;
                    updatedSecondBlockOpacity = currentSecondBlockOpacity - CHANGE_OPACITY_SPEED;

                    if (updatedFirstBlockOpacity < NO_OPACITY) {
                        updatedFirstBlockOpacity = NO_OPACITY;
                    }

                    if(updatedSecondBlockOpacity < DEFAULT_FIRST_BLOCK_OPACITY) {
                        updatedSecondBlockOpacity = DEFAULT_FIRST_BLOCK_OPACITY;
                    }
                }
            }

            if (animationSectionScrollDirection === ANIMATION_DIRECTION_UP) {
                updatedFirstBlockOpacity = currentFirstBlockOpacity + CHANGE_OPACITY_SPEED;
                updatedSecondBlockOpacity = currentSecondBlockOpacity + CHANGE_OPACITY_SPEED_INCREASED;

                if (updatedFirstBlockOpacity > FIRST_BLOCK_OPACITY) {
                    updatedFirstBlockOpacity = FIRST_BLOCK_OPACITY;
                }

                if(updatedSecondBlockOpacity > FULL_OPACITY) {
                    updatedSecondBlockOpacity = FULL_OPACITY;
                }

                //debugger;

                const zeroVisibleBlock = firstVisibleBlock - 0;
                if(!!blocks[zeroVisibleBlock]) {
                    blocks[firstVisibleBlock].style.opacity = `${updatedFirstBlockOpacity}`;
                }

                updatedFirstBlockOpacity = updatedSecondBlockOpacity;
                updatedSecondBlockOpacity = FULL_OPACITY;
            }

            blocks[firstVisibleBlock].style.opacity = `${updatedFirstBlockOpacity}`;
            blocks[secondVisibleBlock].style.opacity = `${updatedSecondBlockOpacity}`;

            opacityHelper_TrackedPrevBlocks = currentTrackedBlocks;
        }

        proceedAnimationFn = function proceedAnimation() {
            const animationCurrentTime = new Date(),
                fps = animationCurrentTime - animationPrevTime;

            // In order do not proceed animation too often
            if (fps < SCROLL_FPS && !isFirstAnimationRun) {
                cancelAnimationFrameCallback = requestAnimationFrame(proceedAnimation);
                return;
            } else {
                isFirstAnimationRun = false;
            }

            /*
                ============================================================
                                    Proceed animation
                ============================================================
             */

            /*
                ============================================================
                                    Picture moving animation
                ============================================================
             */
            proceedPictureMoving(blocks, visibleBlocksIndexes, scrollDirection);

            /*
                ============================================================
                                    Section moving animation
                ============================================================
             */
            const sectionAfterScroll = animationScrolled + (ANIMATION_SCROLL_STEP * scrollDirection);
            animationSection.style.left = sectionAfterScroll + 'px';

            animationScrolled = sectionAfterScroll;

            visibleBlocksIndexes = updateBlocksTrackList(blocks, visibleBlocksIndexes, animationScrolled, scrollDirection);
            updatedBlocksOpacity(blocks, visibleBlocksIndexes, scrollDirection);

            // Check animation scroll direction
            if (
                Math.abs(animationScrolled) > animationToBeScrolled
                || animationScrolled === ANIMATION_DEFAULT_SCROLLED
            ) {
                //console.info('animation direction scroll finished. Change direction');
                scrollDirection = scrollDirection === SCROLL_DIRECTION_LEFT
                    ? SCROLL_DIRECTION_RIGHT
                    : SCROLL_DIRECTION_LEFT;

                // RESTORE default elements position
                if (scrollDirection === SCROLL_DIRECTION_LEFT) {
                    requestAnimationFrame(restoreInitialAnimationSettings);
                }
            }

            /*
                Finish animation
             */
            animationPrevTime = new Date();
            cancelAnimationFrameCallback = requestAnimationFrame(proceedAnimation);
        };

        function proceedPictureMoving(blocks, trackedBlocksIndexes, direction) {
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
        cancelAnimationFrameCallback = requestAnimationFrame(proceedAnimationFn);
    }

    /*
        ============================================================
                    USER SCROLLING
        ============================================================
    */
    let timeOutId,
        userPrevTop = (!!window.pageYOffset)
            ? window.pageYOffset
            : (document.documentElement || document.body.parentNode || document.body).scrollTop;

    function userScrolling() {
        const userCurrTop = (!!window.pageYOffset)
            ? window.pageYOffset
            : (document.documentElement || document.body.parentNode || document.body).scrollTop;

        // CLEAR PREV ANIMATION RUNNERS
        clearTimeout(timeOutId);
        window.cancelAnimationFrame(cancelAnimationFrameCallback);

        TRANSLATE_3D_MAX_VALUE = 50;
        ANIMATION_SCROLL_STEP = 800;
        if (userCurrTop < userPrevTop) {
            console.log('up'); // TODO: DEL
            scrollDirection = ANIMATION_DIRECTION_UP;
            cancelAnimationFrameCallback = requestAnimationFrame(proceedAnimationFn);
        } else {
            console.log('down'); // TODO: DEL
            scrollDirection = ANIMATION_DIRECTION_DOWN;
            cancelAnimationFrameCallback = requestAnimationFrame(proceedAnimationFn);
        }
        userPrevTop = userCurrTop;

        timeOutId = setTimeout(() => {
            TRANSLATE_3D_MAX_VALUE = DEFAULT_TRANSLATE_3D_MAX_VALUE;
            ANIMATION_SCROLL_STEP = DEFAULT_ANIMATION_SCROLL_STEP;
            cancelAnimationFrameCallback = requestAnimationFrame(proceedAnimationFn);
        }, 1500);
    }
})();
