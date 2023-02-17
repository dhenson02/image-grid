"use strict";

import {
    requestIdleCallback,
    cancelIdleCallback,
} from "./utils.js";

(async function ( window, document, undefined ) {
    const LOADER_TIMEOUT = 800;
    const loaderEl = document.getElementById(`loader`);
    let frag2 = null;
    let counter = 0;
    let idle;
    let rendering = false;

    const res = await Promise.all([
        fetch(`/fake-oahu/public/fake/png.json`),
        fetch(`/fake-oahu/public/fake/jpg.json`),
        // fetch(`/gun_images.json`),
    ]);

    const [
        png,
        jpg,
    ] = res;

    const files = [
        ...(await png.json()),
        ...(await jpg.json()).slice(0, 200),
    ].map(file => `fake/${file}`);

    let images = new Map(files.map(f => [
        `${f}`,
        0
    ]));

    let timer = handleResize(true);

    function getRandoms ( count = images.size ) {
        const set = new Set(
            [ ...new Array(count) ].map(
                () => ~~(Math.random() * count)
            )
        );
        return [ ...set ];
    }

    function render ( width = window.innerWidth ) {
        const idxArr = getRandoms(images.size).slice(0, ~~(Math.random() * images.size));
        const files = [ ...images.keys() ];

        const colW = ~~(
            width * 0.2
        );

        const imageMaker = makeImg.bind(null, colW);

        function fillImagesRecur ( frag = document.createDocumentFragment() ) {
            const i = idxArr.pop();
            if ( i === undefined ) {
                return frag;
            }

            const file = files[ i ];
            const img = imageMaker();
            img.src = file;

            const height = images.get(file);
            if ( height > 0 ) {
                img.height = height;
            }

            if ( img.height > 0 ) {
                images.set(img.src, ~~img.height);
            }

            frag.appendChild(img);

            return fillImagesRecur(frag);
        }

        frag2 = fillImagesRecur();
        const oldGrid = document.getElementById(`grid`);
        const newGrid = document.createElement(`div`);
        newGrid.id = `grid`;
        oldGrid.parentNode.replaceChild(newGrid, oldGrid);
        newGrid.appendChild(frag2);
    }

    function makeImg ( width ) {
        const img = new Image();

        img.width = width;
        img.className = `img`;

        return img;
    }

    function handleResize ( start = false ) {
        if ( start ) {
            loaderEl.className = `loading`;
        }

        let insideTimer = setTimeout(() => {
            if ( !timer || insideTimer !== timer ) {
                return clearTimeout(insideTimer);
            }

            timer = clearTimeout(timer);
            render();
            requestIdleCallback(() => {
                loaderEl.className = ``;
            });
        }, LOADER_TIMEOUT);

        return insideTimer;
    }

    window.addEventListener(`resize`, function ( event ) {
        if ( timer ) {
            clearTimeout(timer);
        }
        timer = handleResize(!timer);
    }, { passive: true });


})(window, window.document).catch(console.error);
