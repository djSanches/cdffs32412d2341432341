(function () {
    'use strict';

    if (window.plugin_no_clock_ready) return;
    window.plugin_no_clock_ready = true;

    var STYLE_ID = 'no-clock-style';

    function addStyle() {
        if (document.getElementById(STYLE_ID)) return;

        var style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = '.head__time { display: none !important; }';
        document.head.appendChild(style);
    }

    function removeClock() {
        var nodes = document.querySelectorAll('.head__time');
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].parentNode && nodes[i].parentNode.removeChild(nodes[i]);
        }
    }

    function start() {
        addStyle();
        removeClock();

        // на случай, если Lampa перерисует шапку
        if (window.MutationObserver) {
            var head = document.querySelector('.head') || document.body;
            new MutationObserver(removeClock).observe(head, { childList: true, subtree: true });
        }
    }

    if (window.appready) start();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') start();
        });
    }
})();
