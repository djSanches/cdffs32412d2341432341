/*
 * simple-brand.js — плагин для Lampa: упрощённый интерфейс + свой брендинг.
 *
 * Что делает:
 *  - скрывает лишние пункты бокового меню и иконки в верхней панели;
 *  - убирает кнопку «Трейлер» в карточке фильма;
 *  - меняет название вкладки, иконку (favicon), текст/картинку логотипа и акцентный цвет.
 *
 * Все настройки — в блоке CONFIG ниже. Больше ничего менять не нужно.
 *
 * Подключение:
 *  - Lampa: Настройки → Расширения → Добавить плагин → URL этого файла;
 *  - Lampac: положить файл в wwwroot/ (будет доступен как http://СЕРВЕР:9118/simple-brand.js)
 *    и подключить в plugins/override/lampainit.js или через Расширения.
 *
 * ВАЖНО: селекторы написаны по структуре Lampa, но в разных версиях она слегка отличается.
 * Если что-то не скрылось — откройте Lampa в браузере, нажмите F12, найдите элемент
 * и добавьте его селектор в нужный список ниже.
 */
(function () {
    'use strict';

    // ===================== НАСТРОЙКИ =====================
    var CONFIG = {
        // Название вашего сервиса (вкладка браузера и текст логотипа)
        brandName: 'MyKino',

        // Своя картинка-логотип (URL или data:URI). Пусто — будет текстовый логотип.
        logoUrl: '',

        // Иконка вкладки браузера (URL). Пусто — не менять.
        faviconUrl: '',

        // Акцентный цвет интерфейса (фокус, выделение). Пусто — не менять.
        accentColor: '#e50914',

        // Убрать кнопку «Трейлер» в карточке
        hideTrailers: true,

        // Пункты бокового меню, которые нужно скрыть (значение атрибута data-action)
        hideMenuActions: [
            'feed',        // Лента
            'relise',      // Релизы
            'anime',       // Аниме
            'catalog',     // Каталог
            'filter',      // Фильтр
            'subscribes',  // Подписки
            'timetable',   // Расписание
            'mytorrents',  // Мои торренты
            'console'      // Консоль
        ],

        // Иконки в верхней панели, которые нужно скрыть (CSS-классы без точки)
        hideHeadActions: [
            'open--premium',    // Premium
            'open--feed',       // Лента
            'open--broadcast',  // Трансляция
            'open--profile'     // Профиль (уберите из списка, если нужны профили)
        ],

        // Разделы настроек, которые нужно скрыть (значение data-component).
        // По умолчанию пусто, чтобы вы не потеряли доступ к нужным настройкам.
        // Примеры: 'plugins', 'parser', 'backup', 'tmdb', 'more'
        hideSettingsComponents: []
    };
    // =====================================================

    function css(selectors, rule) {
        if (!selectors.length) return '';
        return selectors.join(',\n') + ' {' + rule + '}\n';
    }

    function buildStyles() {
        var out = '';
        var brand = JSON.stringify(String(CONFIG.brandName || ''));

        // Боковое меню
        out += css(CONFIG.hideMenuActions.map(function (a) {
            return '.menu__item[data-action="' + a + '"]';
        }), 'display:none !important;');

        // Верхняя панель
        out += css(CONFIG.hideHeadActions.map(function (c) {
            return '.head__action.' + c;
        }), 'display:none !important;');

        // Разделы настроек
        out += css(CONFIG.hideSettingsComponents.map(function (c) {
            return '.settings-folder[data-component="' + c + '"]';
        }), 'display:none !important;');

        // Трейлеры
        if (CONFIG.hideTrailers) {
            out += '.view--trailer, .full-start__button.view--trailer {display:none !important;}\n';
        }

        // Логотип
        if (CONFIG.logoUrl) {
            out += '.head__logo-icon > * {display:none !important;}\n' +
                '.head__logo-icon {background:url("' + CONFIG.logoUrl + '") center / contain no-repeat !important;' +
                'min-width:8em; height:2.2em;}\n';
        } else if (CONFIG.brandName) {
            out += '.head__logo-icon > * {display:none !important;}\n' +
                '.head__logo-icon {width:auto !important; height:auto !important;}\n' +
                '.head__logo-icon::after {content:' + brand + '; font-size:1.4em; font-weight:700;' +
                'letter-spacing:.04em;}\n';
        }

        // Акцентный цвет
        if (CONFIG.accentColor) {
            var c = CONFIG.accentColor;
            out += '.full-start__button.focus, .simple-button.focus, .settings-param.focus, .selector.focus,' +
                '.menu__item.focus, .menu__item.traverse, .head__action.focus {' +
                'background-color:' + c + ' !important; color:#fff !important;}\n';
        }

        return out;
    }

    function applyStyles() {
        if (document.getElementById('simple-brand-style')) return;
        var style = document.createElement('style');
        style.id = 'simple-brand-style';
        style.textContent = buildStyles();
        document.head.appendChild(style);
    }

    function applyBrand() {
        if (CONFIG.brandName) document.title = CONFIG.brandName;

        if (CONFIG.faviconUrl) {
            var links = document.querySelectorAll('link[rel~="icon"]');
            if (links.length) {
                for (var i = 0; i < links.length; i++) links[i].href = CONFIG.faviconUrl;
            } else {
                var l = document.createElement('link');
                l.rel = 'icon';
                l.href = CONFIG.faviconUrl;
                document.head.appendChild(l);
            }
        }
    }

    function start() {
        applyStyles();
        applyBrand();

        // Подстраховка для трейлеров: убираем кнопку после полной загрузки карточки
        if (CONFIG.hideTrailers && window.Lampa && Lampa.Listener) {
            Lampa.Listener.follow('full', function (e) {
                if (e.type == 'complite') {
                    try {
                        e.object.activity.render().find('.view--trailer').remove();
                    } catch (err) {}
                }
            });
        }
    }

    // Стили можно применить сразу, не дожидаясь готовности приложения
    try { applyStyles(); } catch (e) {}

    if (window.appready) start();
    else if (window.Lampa && Lampa.Listener) {
        Lampa.Listener.follow('app', function (e) {
            if (e.type == 'ready') start();
        });
    } else {
        // Запасной вариант, если Lampa ещё не инициализировалась
        document.addEventListener('DOMContentLoaded', start);
    }
})();
