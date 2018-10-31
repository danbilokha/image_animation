'use strict';

const settings = {
    SET_FULL_ANIMATION_HEIGHT: false, // set height, which animation section has
    DEFAULT_FIRST_BLOCK_OPACITY: '0.6',
    DEFAULT_SECOND_BLOCK_OPACITY: '0.8',
    DEFAULT_THIRD_BLOCK_OPACITY: '0.9',
    CHANGE_OPACITY_SPEED: 0.1,
    CHANGE_OPACITY_SPEED_INCREASED: 0.2,
    SCROLL_FPS: 2000,
    SHADOW_FIXES: 1.5,
    DEFAULT_TRANSLATE_3D_INITIAL_VALUE: 3,
    DEFAULT_TRANSLATE_3D_MAX_VALUE: 5,
    DEFUALT_ANIMATION_TRANSLATE_3D_MOVING_USER: 4, // should be less or equal to DEFAULT_TRANSLATE_3D_MAX_VALUE
    DEFAULT_ANIMATION_TRANSLATE_3D_MOVING_SYSTEM: 0.5, // should be less or equal to DEFAULT_TRANSLATE_3D_MAX_VALUE
    DEFAULT_ANIMATION_SCROLL_STEP: 200, // Section moving
    CALCULATION_SALT: 2, // Better not to change
    // better to leave it as is
    UNIT_TRANSLATE_3D_X: 'vw',
    UNIT_TRANSLATE_3D_Y: 'vh',
    UNIT_TRANSLATE_3D_Z: 'px',
    COUNT_OF_BLOCK_ADDITIONAL_TRACK: 2
};

(function (settings) {
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

    /*
        ============================================================
                                CHANGEABLE OPTIONS
        ============================================================
     */

    // NO CHANGABLE
    const ANIMATION_DIRECTION_UP = 1,
        ANIMATION_DIRECTION_DOWN = -1,
        SCROLL_DIRECTION_RIGHT = 1,
        SCROLL_DIRECTION_LEFT = -1,
        ANIMATION_DEFAULT_SCROLLED = 0,
        // NO CHANGABLE
        PICTURE_DIMENSION_VALUE = 0,
        SHADOW_DIMENSION_VALUE = -1,
        UNIT_TRANSLATE_3D_X = settings.UNIT_TRANSLATE_3D_X || 'vw',
        UNIT_TRANSLATE_3D_Y = settings.UNIT_TRANSLATE_3D_Y || 'vh',
        UNIT_TRANSLATE_3D_Z = settings.UNIT_TRANSLATE_3D_Z || 'px',
        COUNT_OF_BLOCK_ADDITIONAL_TRACK = settings.COUNT_OF_BLOCK_ADDITIONAL_TRACK || 2,
        NO_OPACITY = 0,
        FULL_OPACITY = 1,
        // MIGHT BE CHANGED IN ORDER TO FIND BEST EXPERIENCE
        // These settings might have impact on performance
        SET_FULL_ANIMATION_HEIGHT = settings.SET_FULL_ANIMATION_HEIGHT || false,
        SCROLL_FPS = settings.SCROLL_FPS || 2000,
        SHADOW_FIXES = settings.SHADOW_FIXES || 1.5,
        DEFAULT_TRANSLATE_3D_INITIAL_VALUE = settings.DEFAULT_TRANSLATE_3D_INITIAL_VALUE || 5,
        DEFAULT_TRANSLATE_3D_MAX_VALUE = settings.DEFAULT_TRANSLATE_3D_MAX_VALUE || 5, // HOW WIDELY ANIMATION COULD BE SPRAYED
        DEFUALT_ANIMATION_TRANSLATE_3D_MOVING_USER = settings.DEFUALT_ANIMATION_TRANSLATE_3D_MOVING_USER || 5,
        DEFAULT_ANIMATION_TRANSLATE_3D_MOVING_SYSTEM = settings.DEFAULT_ANIMATION_TRANSLATE_3D_MOVING_SYSTEM || 1,
        DEFAULT_ANIMATION_SCROLL_STEP = settings.DEFAULT_ANIMATION_SCROLL_STEP || 200,
        // OPTION: opacity - BETTER not change
        CHANGE_OPACITY_SPEED = settings.CHANGE_OPACITY_SPEED || 0.1,
        CHANGE_OPACITY_SPEED_INCREASED = settings.CHANGE_OPACITY_SPEED_INCREASED || 0.2,
        DEFAULT_FIRST_BLOCK_OPACITY = settings.DEFAULT_FIRST_BLOCK_OPACITY || '0.6',
        DEFAULT_SECOND_BLOCK_OPACITY = settings.DEFAULT_SECOND_BLOCK_OPACITY || '0.8',
        DEFAULT_THIRD_BLOCK_OPACITY = settings.DEFAULT_THIRD_BLOCK_OPACITY || '0.9',
        FIRST_BLOCK_OPACITY = DEFAULT_FIRST_BLOCK_OPACITY,
        SECOND_BLOCK_OPACITY = DEFAULT_SECOND_BLOCK_OPACITY,
        THIRD_BLOCK_OPACITY = DEFAULT_THIRD_BLOCK_OPACITY,
        CALCULATION_SALT = settings.CALCULATION_SALT || 2;

    /*
        ============================================================
                                NOT CHANGEABLE OPTIONS
        ============================================================
     */
    let TRANSLATE_3D_INITIAL_VALUE = DEFAULT_TRANSLATE_3D_INITIAL_VALUE,
        ANIMATION_SCROLL_STEP = DEFAULT_ANIMATION_SCROLL_STEP,
        ANIMATION_TRANSLATE_3D_MOVING = DEFAULT_ANIMATION_TRANSLATE_3D_MOVING_SYSTEM;

    let cancelAnimationFrameCallback,
        cancelAnimationProceedRestoringInitialElementsSettingsFrameCallback,
        proceedAnimationFn;

    // DOM ELEMENTS
    const animationBaseDOM = document.getElementsByClassName('base')[0],
        animationSectionDOM = document.getElementsByClassName('section')[0],
        animationBlocksDOM = document.getElementsByClassName('block'),
        animationPicturesDOM = document.getElementsByClassName('picture');

    /*
        Animation state variables
     */
    const defaultElementsPositions = {};
    let scrollDirection = SCROLL_DIRECTION_LEFT;

    document.addEventListener('DOMContentLoaded', run);
    window.addEventListener('resize', run);

    function run() {
        if (!!cancelAnimationFrameCallback) {
            window.cancelAnimationFrame(cancelAnimationFrameCallback);
        }

        if(!!cancelAnimationProceedRestoringInitialElementsSettingsFrameCallback) {
            window.cancelAnimationFrame(cancelAnimationProceedRestoringInitialElementsSettingsFrameCallback);
        }

        window.removeEventListener('scroll', userScrolling);
        proceedExecution();
    }

    function proceedExecution() {
        if (SET_FULL_ANIMATION_HEIGHT) {
            runAsync(
                changeStyles,
                animationBaseDOM,
                animationSectionDOM,
                [
                    {'style.height': 'offsetWidth'},
                    {'style.height': 'px'}
                ]
            );
        }

        animation();
        //window.addEventListener('scroll', userScrolling);
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
        const cssText = cssTextStyleValue.split(',');

        if (!cssText[0] || !cssText[0].length) {
            return {x: 0, y: 0, z: 0}
        }

        const x = cssText[0].split('(')[1].slice(0, -2),
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

    function changeOpacity(elemDOM, changeSpeed, animationSectionScrollDirection) {
        let currentBlockDOMOpacity = +elemDOM.style.opacity;

        if (isNaN(currentBlockDOMOpacity)) {
            currentBlockDOMOpacity = 1;
        }

        let newBlockDOMOpacity = currentBlockDOMOpacity + changeSpeed * animationSectionScrollDirection;

        if (newBlockDOMOpacity > currentBlockDOMOpacity && newBlockDOMOpacity > 1) {
            newBlockDOMOpacity = 1;
        }

        if (newBlockDOMOpacity < currentBlockDOMOpacity && newBlockDOMOpacity < 0) {
            newBlockDOMOpacity = 0;
        }

        elemDOM.style.opacity = newBlockDOMOpacity;
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

    function animation() {
        setInitialAnimationPicturesAndShadowsSettings();
        //animationRunner();
    }

    function setInitialBlocksOpacity(blocks = animationBlocksDOM, visibleBlocksIndexes) {
        let _visibleBlocksIndexes = visibleBlocksIndexes;
        if (typeof _visibleBlocksIndexes === 'number') {
            _visibleBlocksIndexes = [];
            for (let i = 0; i < visibleBlocksIndexes; i += 1) {
                _visibleBlocksIndexes.push(i);
            }
        }

        blocks[_visibleBlocksIndexes[0]].style.opacity = FIRST_BLOCK_OPACITY;
        blocks[_visibleBlocksIndexes[1]].style.opacity = SECOND_BLOCK_OPACITY;
        blocks[_visibleBlocksIndexes[2]].style.opacity = THIRD_BLOCK_OPACITY;

        for (let i = 2; i < _visibleBlocksIndexes.length; i += 1) {
            blocks[i].style.opacity = FULL_OPACITY;
        }
    }

    function setRowPicturesAndShadows(rowElem, blockNumber, order = ANIMATION_DIRECTION_DOWN) {
        let picturesDOM = rowElem.getElementsByClassName('picture'),
            foundedPicturesLen = picturesDOM.length,
            shadowsDOM = rowElem.getElementsByClassName('shadow'),
            isFloating = (order === ANIMATION_DIRECTION_DOWN) ? -1 : 1;
        const translateInitial = ((DEFAULT_TRANSLATE_3D_INITIAL_VALUE - blockNumber) > 0)
            ? (DEFAULT_TRANSLATE_3D_INITIAL_VALUE - blockNumber)
            : 0;

        // Use foundedPicturesLen here because count of picturesDOM is equal to
        // count of shadows
        for (let i = 0; i < foundedPicturesLen; i += 1) {
            const pictureDOM = picturesDOM[i],
                shadowDOM = shadowsDOM[i],
                shadowFixes = isFloating > 0 ? SHADOW_FIXES : 0,
                shadow_x = translateInitial + Math.random() * CALCULATION_SALT + shadowFixes,
                shadow_y = shadow_x + (Math.random() * CALCULATION_SALT) + shadowFixes,
                picture_x = (shadow_x + (Math.random() * CALCULATION_SALT)) * isFloating,
                picture_y = (shadow_x + (Math.random() * CALCULATION_SALT)) * isFloating;

            setTranslate3d(
                pictureDOM,
                picture_x,
                picture_y,
                PICTURE_DIMENSION_VALUE
            );
            const pictureUniqueId = setUniqueId(
                pictureDOM, picture_x.toString(), picture_y.toString(), PICTURE_DIMENSION_VALUE.toString()
            );
            saveInitialAnimationSettings(pictureUniqueId, picture_x, picture_y, PICTURE_DIMENSION_VALUE);

            setTranslate3d(
                shadowDOM,
                shadow_x,
                shadow_y,
                SHADOW_DIMENSION_VALUE
            );
            const shadowUniqueId = setUniqueId(
                shadowDOM, shadow_x.toString(), shadow_y.toString(), SHADOW_DIMENSION_VALUE.toString()
            );
            saveInitialAnimationSettings(shadowUniqueId, shadow_x, shadow_y, SHADOW_DIMENSION_VALUE);

            isFloating *= -1;
        }
    }

    function setInitialAnimationPicturesAndShadowsSettings() {
        let blocksDOM = document.getElementsByClassName('block'),
            foundedBlocks = blocksDOM.length,
            firstBlockFirstFowDOM = blocksDOM[0].getElementsByClassName('row-first')[0],
            firstBlockSecondFowDOM = blocksDOM[0].getElementsByClassName('row-second')[0];

        setRowPicturesAndShadows(firstBlockFirstFowDOM, 0, ANIMATION_DIRECTION_DOWN);
        setRowPicturesAndShadows(firstBlockSecondFowDOM, 0, ANIMATION_DIRECTION_UP);

        runAsync((blocks, foundedBlocks) => {
            for (let i = 1; i < foundedBlocks; i += 1) {
                let blockFirstRowDOM = blocks[i].getElementsByClassName('row-first')[0],
                    blockSecondRowDOM = blocks[i].getElementsByClassName('row-second')[0],
                    blockDOM = blocks[i];

                setRowPicturesAndShadows(blockFirstRowDOM, i, ANIMATION_DIRECTION_DOWN);
                setRowPicturesAndShadows(blockSecondRowDOM, i, ANIMATION_DIRECTION_UP);

                // (SET): DEFAULT blocksDOM transition
                const blockDOMUniqueId = setUniqueId(blockDOM, Math.random(), Math.random(), Math.random());
                saveInitialAnimationSettings(blockDOMUniqueId, 0, 0, 0);
            }
        }, blocksDOM, foundedBlocks);
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
        // SIZES
        const innerClientWidth = window.innerWidth,
            blockWidth = animationBlocksDOM[0].offsetWidth,
            animationSectionWidth = animationSectionDOM.offsetWidth,
            animationToBeScrolled = animationSectionWidth - innerClientWidth;

        // ANIMATION CALCULATIONS
        const blocksToBeFittedInWindow = innerClientWidth / blockWidth,
            numberOfTrackedBlockSimultaneously = Math.round(blocksToBeFittedInWindow + COUNT_OF_BLOCK_ADDITIONAL_TRACK);

        let visibleBlocksIndexes = setInitialBlocksTrackList(numberOfTrackedBlockSimultaneously);
        setInitialBlocksOpacity(animationBlocksDOM, visibleBlocksIndexes);

        // SYSTEM ANIMATION
        //const elementPositions = {};

        // SYSTEM ANIMATION SETTINGS
        let animationStart = new Date(),
            animationPrevTime = animationStart,
            isFirstAnimationRun = true,
            sectionBordersTimeout;

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

        proceedAnimationFn = function proceedAnimation() {
            const animationCurrentTime = new Date(),
                fps = animationCurrentTime - animationPrevTime,
                sectionAfterScroll = animationScrolled + (ANIMATION_SCROLL_STEP * scrollDirection);

            // In order do not proceed animation too often
            if (fps < SCROLL_FPS && !isFirstAnimationRun) {
                window.cancelAnimationFrame(cancelAnimationFrameCallback);
                cancelAnimationFrameCallback = requestAnimationFrame(proceedAnimation);
                return;
            } else {
                isFirstAnimationRun = false;
            }

            // Check, that section is moving in right frames
            if (sectionAfterScroll > 0 || Math.abs(sectionAfterScroll) > animationToBeScrolled) {
                scrollDirection = scrollDirection === SCROLL_DIRECTION_LEFT
                    ? SCROLL_DIRECTION_RIGHT
                    : SCROLL_DIRECTION_LEFT;

                clearTimeout(sectionBordersTimeout);
                sectionBordersTimeout = setTimeout(() => {
                    proceedRestoringInitialElementsSettings();
                    window.cancelAnimationFrame(cancelAnimationFrameCallback);
                    cancelAnimationFrameCallback = requestAnimationFrame(proceedAnimation);
                }, SCROLL_FPS);

                return;
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
            proceedAnimationMoving(animationBlocksDOM, visibleBlocksIndexes, scrollDirection);

            /*
                ============================================================
                                    Section moving animation
                ============================================================
             */
            animationSectionDOM.style.left = sectionAfterScroll + 'px';

            animationScrolled = sectionAfterScroll;

            visibleBlocksIndexes = updateBlocksTrackList(animationBlocksDOM, visibleBlocksIndexes, animationScrolled, scrollDirection);

            // Check animation scroll direction
            if (
                Math.abs(animationScrolled) > animationToBeScrolled
                || animationScrolled === ANIMATION_DEFAULT_SCROLLED
            ) {
                scrollDirection = scrollDirection === SCROLL_DIRECTION_LEFT
                    ? SCROLL_DIRECTION_RIGHT
                    : SCROLL_DIRECTION_LEFT;

                setInitialBlocksOpacity(animationBlocksDOM, visibleBlocksIndexes);
                proceedRestoringInitialElementsSettings();
            }

            /*
                Finish animation
             */
            animationPrevTime = new Date();
            window.cancelAnimationFrame(cancelAnimationFrameCallback);
            cancelAnimationFrameCallback = requestAnimationFrame(proceedAnimation);
        };

        function proceedAnimationMoving(blocksDOM, trackedBlocksIndexes, animationSectionScrollDirection) {
            trackedBlocksIndexes.forEach((index) => {
                const blockPicturesDOM = blocksDOM[index].getElementsByClassName('picture'),
                    blockPicturesLen = blockPicturesDOM.length,
                    blockShadowsDOM = blocksDOM[index].getElementsByClassName('shadow'),
                    blockShadowsLen = blockShadowsDOM.length,
                    blockDOM = blocksDOM[index];

                // SET PICTURES
                for (let i = 0; i < blockPicturesLen; i += 1) {
                    const sign = i % 2 === 0 ? 1 : -1;
                    animateElementTranslate3d(blockPicturesDOM[i], animationSectionScrollDirection, sign, ANIMATION_TRANSLATE_3D_MOVING);
                }

                // SET SHADOW
                for (let i = 0; i < blockShadowsLen; i += 1) {
                    const sign = i % 2 === 0 ? 1 : -1;
                    animateElementTranslate3d(blockShadowsDOM[i], animationSectionScrollDirection, sign, ANIMATION_TRANSLATE_3D_MOVING);
                }

                // Block moving
                animateElementTranslate3d(blockDOM, animationSectionScrollDirection, 1, ANIMATION_TRANSLATE_3D_MOVING);
            });

            // BLOCK OPACITY
            const blockFirstDOM = blocksDOM[trackedBlocksIndexes[0]],
                blockSecondDOM = blocksDOM[trackedBlocksIndexes[1]];
            let opacityChangeSpeed1 = 0,
                opacityChangeSpeed2 = 0;

            if (animationSectionScrollDirection === SCROLL_DIRECTION_LEFT) {
                opacityChangeSpeed1 = CHANGE_OPACITY_SPEED_INCREASED;
                opacityChangeSpeed2 = CHANGE_OPACITY_SPEED;
            } else if (animationSectionScrollDirection === SCROLL_DIRECTION_RIGHT) {
                opacityChangeSpeed1 = CHANGE_OPACITY_SPEED;
                opacityChangeSpeed2 = CHANGE_OPACITY_SPEED_INCREASED;
            }

            changeOpacity(blockFirstDOM, opacityChangeSpeed1, animationSectionScrollDirection);
            const nextBlockAfterTracked = blocksDOM[trackedBlocksIndexes[trackedBlocksIndexes.length - 1] + 1];
            changeOpacity(blockSecondDOM, opacityChangeSpeed2, animationSectionScrollDirection);

            function animateElementTranslate3d(elemDOM, direction, sign, salt) {
                const _elemDOM = elemDOM,
                    {x: xPic, y: yPic, z: zPic} = getTranslate3dValues(_elemDOM.style.transform);

                let xPicNew = (+xPic + salt * direction * sign),
                    yPicNew = (+yPic + salt * direction * sign),
                    zPicNew = zPic;

                xPicNew = Math.abs(xPicNew) > DEFAULT_TRANSLATE_3D_MAX_VALUE ? (+xPic) : xPicNew;
                yPicNew = Math.abs(yPicNew) > DEFAULT_TRANSLATE_3D_MAX_VALUE ? (+yPic) : yPicNew;

                _elemDOM.style.transform = `translate3d(
                ${xPicNew}${UNIT_TRANSLATE_3D_X}, 
                ${yPicNew}${UNIT_TRANSLATE_3D_Y}, 
                ${zPicNew}${UNIT_TRANSLATE_3D_Z}
                )`;

            }
        }

        function proceedRestoringInitialElementsSettings() {
            // RESTORE default elements position
            window.cancelAnimationFrame(cancelAnimationProceedRestoringInitialElementsSettingsFrameCallback);
            restoreInitialAnimationSettings();
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

        ANIMATION_SCROLL_STEP = DEFAULT_ANIMATION_SCROLL_STEP * 5;
        ANIMATION_TRANSLATE_3D_MOVING = DEFUALT_ANIMATION_TRANSLATE_3D_MOVING_USER;
        if (userCurrTop < userPrevTop) {
            scrollDirection = ANIMATION_DIRECTION_UP;
        } else {
            scrollDirection = ANIMATION_DIRECTION_DOWN;
        }
        userPrevTop = userCurrTop;
        setUserScrollTransitions();

        setInitialBlocksOpacity(animationBlocksDOM, animationBlocksDOM.length - 1);

        cancelAnimationFrameCallback = requestAnimationFrame(proceedAnimationFn);
        timeOutId = setTimeout(() => {
            ANIMATION_TRANSLATE_3D_MOVING = DEFAULT_ANIMATION_TRANSLATE_3D_MOVING_SYSTEM;
            ANIMATION_SCROLL_STEP = DEFAULT_ANIMATION_SCROLL_STEP;

            removeUserScrollTransitions();
            window.cancelAnimationFrame(cancelAnimationFrameCallback);
            cancelAnimationFrameCallback = requestAnimationFrame(proceedAnimationFn);
        }, SCROLL_FPS);
    }
    
    function setUserScrollTransitions() {
        animationSectionDOM.classList.add('section__user_scroll');

        const animationBlocksDOMLen = animationBlocksDOM.length;
        for(let i = 0; i < animationBlocksDOMLen; i += 1) {
            animationBlocksDOM[i].classList.add('block__user-scroll')
        }

        const animationPicturesDOMLen = animationPicturesDOM.length;
        for(let i = 0; i < animationPicturesDOMLen; i += 1) {
            animationPicturesDOM[i].classList.add('picture__user-scroll')
        }
    }
    
    function removeUserScrollTransitions() {
        animationSectionDOM.classList.remove('section__user_scroll');

        const animationBlocksDOMLen = animationBlocksDOM.length;
        for(let i = 0; i < animationBlocksDOMLen; i += 1) {
            animationBlocksDOM[i].classList.remove('block__user-scroll')
        }

        const animationPicturesDOMLen = animationPicturesDOM.length;
        for(let i = 0; i < animationPicturesDOMLen; i += 1) {
            animationPicturesDOM[i].classList.remove('picture__user-scroll')
        }
    }
})(settings);
