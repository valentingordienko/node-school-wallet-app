'use strict';

/**
 * Подключение сторонних модулей
 */
const koa = require('koa');
const serve = require('koa-static');
const router = require('koa-router')();
const bodyParser = require('koa-bodyparser')();
const logger = require('./libs/logger.js')('wallet-app');


/**
 * Подключение модулей приложения
 */
const ApplicationError = require('./libs/application-error');
const CardsModel = require('./models/cards');
const TransactionsModel = require('./models/transactions');


/**
 * Подключение контроллеров приложения
 */
const errorController = require('./controllers/error');
const rootController = require('./controllers/root');
const getCardsController = require('./controllers/cards/get-cards');
const createCardController = require('./controllers/cards/create');
const deleteCardController = require('./controllers/cards/delete');
const getTransactionsController = require('./controllers/transactions/get');
const createTransactionsController = require('./controllers/transactions/create');


/**
 * Создание экземпляра приложения
 */
const app = new koa();


// Сохраним параметр id в ctx.params.id
router.param('id', (id, ctx, next) => next());


/**
 * Описание роутинга приложения
 */
router.get('/', rootController);

router.get('/cards/', getCardsController);
router.post('/cards/', createCardController);
router.delete('/cards/:id', deleteCardController);

router.get('/cards/:id/transactions/', getTransactionsController);
router.post('/cards/:id/transactions/', createTransactionsController);

router.all('/error', errorController);


app.use(async (ctx, next) => {
    const start = new Date();
    await next();
    const ms = new Date() - start;
    logger.log('info', `${ctx.method} ${ctx.url} - ${ms}ms`);
});

// error handler
app.use(async (ctx, next) => {
    try {

        await next();

    } catch (err) {

        logger.log('error', err);

        /**
         * Если ошибка это ошибка уровня приложения то выставляем её стату, иначе это ошибка уровня сервера
         */
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
app.use(serve('./public'));
app.use(router.routes());
app.use(router.allowedMethods());

app.on('error', (err, ctx) => {

    log.error('server error', err, ctx)
});


/**
 * Запуск приложения на 4000 порту
 */
app.listen(4000, () => {
    logger.log('info', 'Application started');
});
