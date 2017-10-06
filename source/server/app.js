'use strict';

const path = require('path');
const fs = require('fs');
const koa = require('koa');
const serve = require('koa-static');
const router = require('koa-router')();
const bodyParser = require('koa-bodyparser')();

const {renderToStaticMarkup} = require('react-dom/server');
const logger = require('./libs/logger.js')('wallet-app');

const getCardsController = require('./controllers/cards/get-cards');
const createCardController = require('./controllers/cards/create');
const deleteCardController = require('./controllers/cards/delete');
const getTransactionsController = require('./controllers/transactions/get');
const createTransactionsController = require('./controllers/transactions/create');

const errorController = require('./controllers/error');

const ApplicationError = require('./libs/application-error');
const CardsModel = require('./models/cards');
const TransactionsModel = require('./models/transactions');

const app = new koa();

const DATA = {
    user: {
        login: 'samuel_johnson',
        name: 'Samuel Johnson'
    }
};

function getView(viewId) {
    // const viewPath = path.resolve(`ssr.${viewId}.js`);
    const viewPath = path.resolve('source', 'server', 'static_markup', `ssr.${viewId}.js`);
    console.log(viewPath);
    return require(viewPath);
}


// Сохраним параметр id в ctx.params.id
router.param('id', (id, ctx, next) => next());


router.get('/', (ctx) => {
    const indexView = getView('app');

    ctx.body = renderToStaticMarkup(indexView(DATA));
});

router.get('/cards/', getCardsController);
router.post('/cards/', createCardController);
router.delete('/cards/:id', deleteCardController);

router.get('/cards/:id/transactions/', getTransactionsController);
router.post('/cards/:id/transactions/', createTransactionsController);

router.all('/error', errorController);

// logger
app.use(async (ctx, next) => {
    const start = new Date();
    await next();
    const ms = new Date() - start;
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// error handler
app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        console.log('Error detected', err);
        ctx.status = err instanceof ApplicationError ? err.status : 500;
        ctx.body = `Error [${err.message}] :(`;
    }
});

// Создадим модель Cards и Transactions на уровне приложения и проинициализируем ее
app.use(async (ctx, next) => {
    ctx.cardsModel = new CardsModel();
    ctx.transactionsModel = new TransactionsModel();

    await Promise.all([
        ctx.cardsModel.loadFile(),
        ctx.transactionsModel.loadFile()
    ]);

    await next();
});


app.use(bodyParser);
app.use(router.routes());
app.use(serve('./public'));

app.listen(4000, () => {
    logger.log('info', 'Application started');
});
