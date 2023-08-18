(function () {

    return {

        setPercent: function (percent) {
            this.find('.progress_bar').width(percent + '%');
            this.find('.progress_text').text(percent + '%');
        },

        onInit: function (jLayout, path, parameterMap, jPopupListLayout) {
            this.setPercent(0);
        },

        setMessage : function(message) {
            this.find('.progress_text').text(message);
        },

        onShow: function (jLayout, path, parameterMap, jPopupListLayout) {
        },
        onHide: function (jLayout, path, parameterMap, jPopupListLayout) {
        }
    };
})();

