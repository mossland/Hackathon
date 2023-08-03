(function () {

    return {

        cssLoading: false,
        htmlLoading: false,

        onConstruct: function (jLayout, path, object, jPopupListLayout) {

            var popup = this;

            var title = Lia.p(object, 'title');

            Triton.PopupHelper.appendLayout(popup, {
                title: title,
                css: {}
            });
        },


        onInit: function (jLayout, path, object, jPopupListLayout) {

            var popup = this;

            var optionList = Lia.p(object, 'optionList');
            var value = Lia.p(object, 'value');
            var onSelected = Lia.p(object, 'onSelected');
            var jContent = popup.find('.popup_content');
            var description = Lia.p(object , 'description');

            popup.radioButtonSection = new Triton.RadioButtonSection({
                css: {'margin-left': '80px', 'margin-right': '80px', 'margin-top': '30px', 'margin-bottom': '20px'},
                appendTo: jContent,
                radioButtonTheme: Triton.RadioButton.Theme.Line,
                optionList: optionList,
                value : value
            });

            if(String.isNotBlank(description)) {
                var jDesc = $('<p style="font-size : 12px; color:#707070; margin-bottom : 20px"></p>').html(description);
                jContent.append(jDesc);
            }

            new Triton.FlatButton({
                appendTo: jContent,
                content: '확인',
                theme: Triton.FlatButton.Theme.Normal,
                css: {'margin-bottom': '20px'},
                onClick: function (e) {

                    var option = popup.radioButtonSection.getSelectedOption();

                    var optionOnSelected = option['onSelected'];
                    if (optionOnSelected != undefined) {
                        optionOnSelected();
                    }

                    if (onSelected != undefined) {
                        onSelected(Lia.p(option, 'value'));
                    }

                    popup.hide();
                }
            });

            new Triton.FlatButton({
                appendTo: jContent,
                content: '취소',
                theme: Triton.FlatButton.Theme.Delete,
                css: {'margin-left': '7px'},
                onClick: function (e) {

                    popup.hide();
                }
            });

        },
        onShow: function (jLayout, path, parameterMap, jPopupListLayout) {
        },
        onHide: function (jLayout, path, parameterMap, jPopupListLayout) {
        }
    };
})();

