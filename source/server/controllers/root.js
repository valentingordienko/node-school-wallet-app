'use strict';

const path = require('path');
const {renderToStaticMarkup} = require('react-dom/server');


function getView(viewId) {
    const viewPath = path.resolve('source', 'server', 'static_markup', `ssr.${viewId}.js`);
    return require(viewPath);
}

const DATA = {
    user: {
        login: 'valentin_gordienko',
        name: 'Valentin Gordienko',
    }
};

module.exports = async (ctx) => {

    const indexView = getView('app');

    ctx.body = renderToStaticMarkup(indexView(DATA));
};