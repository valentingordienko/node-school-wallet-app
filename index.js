/**
 * Подключение внешних модулей необходимый для запуска и работы приложения
 */
const Express = require('express'),// Фрэймворк "Express"
    FS = require('fs'),// Модуль для работы с файловой системой
    Luhn = require('luhn');// Модуль для проверки номеров банковсих карт по алгоритму Луна


/**
 * @const {object} App - Экземпляр приложения
 */
const App = Express();


/**
 * Экземпляры функций промежуточной обработки (middleware)
 *
 * @const {function} BodyParser - Функция промежуточной обработки для парсинга тела запроса
 */
const BodyParser = require('body-parser');


/**
 * @const {string} PathToUserCards - Путь к файлу представляющему базу данных для карт пользователя
 */
const PathToUserCards = './source/cards.json';


/**
 * Указание директории со статичными файлами
 */
App.use(Express.static('public'));


/**
 * Подключение функций промежуточной обрботки
 */
App.use(BodyParser.json());


/**
 * const {object} SendResult - Объект универсальными методами для отправки ответов
 */
const SendResult = {

    /**
     * Метод отправляет ответ со статусом 200 и JSON в теле ответа
     *
     * @prop {object} response - Объект res цикла запрос-ответ
     * @prop {object|array} [responseBody] - Данные передааемые в теле ответа в валидном формате JSON
     */
    json200(response, responseBody = {}) {

        this.sendJSON(response, 200, responseBody);
    },


    /**
     * Метод отправляет ответ со статусом 200 и любыми данными в теле ответа
     *
     * @prop {object} response - Объект res цикла запрос-ответ
     * @prop {*} [responseBody] - Данные передааемые в теле ответа
     */
    _200(response, responseBody) {

        this.send(response, 200, responseBody);
    },


    /**
     * Метод отправляет ответ со статусом 400 и любыми данными в теле ответа
     *
     * @prop {object} response - Объект res цикла запрос-ответ
     * @prop {*} [responseBody] - Данные передааемые в теле ответа
     */
    _400(response, responseBody) {

        this.send(response, 400, responseBody);
    },


    /**
     * Метод отправляет ответ со статусом 404 и любыми данными в теле ответа
     *
     * @prop {object} response - Объект res цикла запрос-ответ
     * @prop {*} [responseBody] - Данные передааемые в теле ответа
     */
    _404(response, responseBody) {

        this.send(response, 404, responseBody);
    },


    /**
     * Метод отправляет ответ со статусом 500 и любыми данными в теле ответа
     *
     * @prop {object} response - Объект res цикла запрос-ответ
     * @prop {*} [responseBody] - Данные передааемые в теле ответа
     */
    _500(response, responseBody) {

        this.send(response, 500, responseBody);
    },


    /**
     * Метод формирует объект ответа и отправляет его
     *
     * @prop {object} response - Объект res цикла запрос-ответ
     * @prop {number} statusCode - Код ответа
     * @prop {*} [responseBody] - Данные передааемые в теле ответа
     */
    send(response, statusCode, responseBody) {

        if (response && statusCode) {
            response.status(statusCode);
            response.send(responseBody);
        }

    },


    /**
     * Метод формирует объект ответа и отправляет его c JSON в теле ответа
     *
     * @prop {object} response - Объект res цикла запрос-ответ
     * @prop {number} statusCode - Код ответа
     * @prop {*} [responseBody] - Данные передааемые в теле ответа
     */
    sendJSON(response, statusCode, responseBody) {

        if (response && statusCode) {
            response.status(statusCode);
            response.json(responseBody);
        }

    }
};


/**
 * Функция возвращает разметку страницы
 *
 * @param {string} content - Контент котрый будет помещён в тело страницы
 *
 * @return {string}
 */
function pageMarkup(content) {

    return `<!doctype html>
	<html>
		<head>
			<link rel="stylesheet" href="/style.css">
		</head>
		<body>
			${content}
		</body>
	</html>`
}


/**
 * Функция выполняет асинхронное чтение файла
 *
 * @prop {string} filePath - Путь к файлу
 *
 * @return {object} - Экземпляр "Promise"
 */
function readFileAsync(filePath) {

    return new Promise((resolve, reject) => {

        FS.readFile(filePath, 'utf-8', (err, data) => {

            if (!err) {

                resolve(data);

            } else {

                reject(err);
            }
        })
    });
}


/**
 * Функция выполняет асинхронную запись файла
 *
 * @prop {string} filePath - Путь к файлу
 * @prop {string} newFileData - Данные для записи в файл
 *
 * @return {object} - Экземпляр "Promise"
 */
function writeFileAsync(filePath, newFileData) {

    return new Promise((resolve, reject) => {

        FS.writeFile(filePath, newFileData, (err) => {

            if (!err) {

                resolve();

            } else {

                reject(err);
            }
        })
    });
}


/**
 * Функция валидирует данные банковской карты.
 * В цикле валидации номера банковской карты присутствует проверка алгоритмом Луна.
 *
 * @param {object} newCardObject - Объект JSON с даными карты
 *
 * @return {boolean}
 */
function newCardValidate(newCardObject) {


    if (newCardObject && newCardObject instanceof Object && newCardObject.constructor === Object && newCardObject.hasOwnProperty('cardNumber')) {

        const symbolsValue = newCardObject.cardNumber.toString().length;

        if ((symbolsValue === 16 || symbolsValue === 14) && Number.isInteger(+newCardObject.cardNumber)) {

            return Luhn.validate(newCardObject.cardNumber);

        }
    }

    return false;

}


/**
 * Запрос к базовой странице сайта.
 * Возвращает разметку базовой страницы сайта.
 */
App.get('/', (req, res) => {

    SendResult._200(res, pageMarkup(`<h1>Hello Smolny!</h1>`));
});


/**
 * Запрос возвращает список всех карт пользователя в формате JSON
 */
App.get('/cards', (req, res, next) => {

    readFileAsync(PathToUserCards)

        .then(data => {

                SendResult.json200(res, JSON.parse(data))

            }
        )

        .catch(next);
});


/**
 * Запрос добавляет новую карту в массив карт пользователя.
 * Если передаваемые данные карты валидны возвращает эти данные.
 * В другом случае возвращает ответ со статусом 400 и текстом "Bad request"
 */
App.post('/cards', (req, res, next) => {

    const NewCardData = req.body;


    if (newCardValidate(NewCardData)) {

        readFileAsync(PathToUserCards)

            .then(data => {

                let Cards = JSON.parse(data);


                if (Cards.find(card => {

                        if (card) {

                            return +card.cardNumber === +NewCardData.cardNumber
                        }

                    })) {

                    SendResult._400(res);
                    return;
                }


                if (!NewCardData.hasOwnProperty('balance')) {

                    NewCardData.balanced = "0";

                }

                Cards.push(NewCardData);

                return writeFileAsync(PathToUserCards, JSON.stringify(Cards));

            })

            .then(data => {

                SendResult.json200(res, NewCardData);

            })

            .catch(next);

    } else {

        SendResult._400(res);

    }
});


/**
 * Запрос удаляет карту из массива карт пользователя по её ID (ID - порядковый номер в массиве)
 * В случае успешного удаления возвращает ответ со статусо 200 и текстом "OK"
 * Если карта по желаемоому ID отсутствует возвращает ответ со статусом 404 и текстом "Card not found"
 */
App.delete('/cards/:id', (req, res, next) => {

    const CardId = req.params.id;


    readFileAsync(PathToUserCards)

        .then(data => {

            let Cards = JSON.parse(data);

            if (Cards[CardId]) {

                Cards[CardId] = null;

                return writeFileAsync(PathToUserCards, JSON.stringify(Cards));

            } else {

                SendResult._404(res);

            }

        })

        .then(() => {

            SendResult._200(res);

        })

        .catch(next);

});


/**
 * Запрос проверяет работу приложения на перехват ошибок
 */
App.get('/error', (req, res) => {
    throw Error('Oops!');
});


/**
 * Запрос возвращает данные о переводе денег
 */
App.get('/transfer', (req, res) => {
    const {amount, from, to} = req.query;

    SendResult.json200(res, {
        result: 'success',
        amount,
        from,
        to
    });
});


/**
 * Использование промежуточного обработчика "Перехват ошибок"
 */
App.use(function (err, req, res, next) {

    console.log(err.stack);

    SendResult._500(res, {"Error": err.stack});
});


/**
 * Запуск приложения на порту 3000
 */
App.listen(3000, () => {
    console.log('YM Node School App listening on port 3000!');
});
