

var ApiUrl = {
    generateResult : '/api/generateResult'
}

var Code = {
    SUCCESS : 'SUCCESS'
}


Lia.Strings.setLocale(Lia.Strings.Locale.EN);
Triton.Responsive.init(false);

var Requester = new Lia.Requester({

    onRequestStart: function (request) {

        if (request['parameterMap'] == undefined) {
            request['parameterMap'] = {};
        }

        var autoLoading = Lia.p(request, 'object', 'autoLoading');
        if (autoLoading == undefined)
            autoLoading = false;

        if (autoLoading) {
            Lia.LoadingPopupManager.show();
        }
    },

    onRequestEnded: function (status, data, request) {

        var autoLoading = Lia.p(request, 'object', 'autoLoading');
        if (autoLoading == undefined)
            autoLoading = false;

        if (autoLoading) {
            Lia.LoadingPopupManager.hide();
        }
    },

    responseCheckHandler: function (status, data, request) {

        // 응답 체크하여 결과값 전달
        var code = undefined;
        var error = (status == Requester.Status.ERROR || data == undefined);
        if (!error) {

            if (request['dataType'] == 'json' || request['dataType'] == 'jsonp') {

                code = Lia.p(data, 'code');

                if (code != Code.SUCCESS) {
                    error = true;
                }
            }
        }

        if (error) {

            var autoPopup = Lia.p(request, 'object', 'autoPopup');
            if (autoPopup == undefined)
                autoPopup = true;

            if (autoPopup) {

                var message = Lia.p(data, 'message');
                if (String.isBlank(message)) {
                    message = 'ERROR';
                }

                if ( typeof Triton != 'undefined' ) {
                    Triton.AlertManager.alert(message);
                } else {
                    Lia.AlertManager.alert(message);
                }
            }

            return Lia.Requester.Status.ERROR;
        }

        return status;
    }
});
Requester.Status = Lia.Requester.Status;


var PageManager = Lia.PageManager;
PageManager.init({

    requester: Requester,

    onPageInit: function (jPage, jPageContainer, i, parameterMap, beforeParameterMap) {
        Lia.Strings.applyStrings(jPage);
    },

    onSameCheck: function (parameter) {

        return true;
    },

    onMoveCheck: function (parameterMap) {

        return true;
    },

    onPageCheck: function (parameter) {
        return true;
    },

    onProgress: function (status, parameterMap, beforeParameterMap) {

        if (status == PageManager.Status.START) {

            Lia.LoadingPopupManager.show();

        } else if (status == PageManager.Status.ERROR) {

            Lia.LoadingPopupManager.clear();

        } else if (status == PageManager.Status.SUCCESS) {

            Lia.scrollTo(0, 100);

            var page = PageManager.getPage();
            if (page != undefined) {
                Lia.LoadingPopupManager.clear();
            }
        }

    },
    onNormalizeParameter: function (data) {
        data['m1'] = Lia.pcd('home', data, 'm1');
        return data;
    },

    filePathFormatHandler: function (path, data, depth) {
        return path;
    },

    cssFilePathFormatHandler: function (path, data, depth) {
        // return undefined;
        return '/res/page/' + path + '.css';
    },
    htmlFilePathFormatHandler: function (path, data, depth) {
        // return undefined;
        return '/res/page/' + path + '.html';
    },
    jsFilePathFormatHandler: function (path, data, depth) {
        return '/res/page/' + path + '.js';
    },

    cssLoading: false,
    htmlLoading: false,
    parameterPostfixAdding: false,
    title: 'Provably Fair',
    pageParameterNameList: [
        'm1', 'm2', 'm3', 'm4'
    ],
    pageContainerSelectorList: [
        '.page1', '.page2', '.page3', '.page4'
    ]
});
