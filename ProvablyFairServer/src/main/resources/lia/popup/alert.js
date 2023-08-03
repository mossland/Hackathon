(function () {

    return {
        onInit: function (jLayout, path, parameterMap, jPopupListLayout) {

            var popup = this;

            popup.find('.alert_popup_close').attr({
                'src' : LiaSettings.BASE_URL + '/popup/alert_close.png'
            }).on('click', {
                popup : popup
            }, function(e) {

                var popup = e.data.popup;
                popup.hide();

            });

            var cancelable = parameterMap['cancelable'];
            if ( cancelable == true ) {
                popup.find('.dim').addClass('cancelable');
            }

            popup.find('.alert_popup_button').initButton();

            var jTitle = popup.find('.alert_popup_title');
            var jMessage = popup.find('.alert_popup_text_box');
            var jConfirm = popup.find('.alert_popup_confirm_button');
            var jCancel = popup.find('.alert_popup_cancel_button');
            var jImageContainer = popup.find('.alert_popup_image');
            var jInputList = popup.find('.alert_popup_input_list');
            var jPopup = popup.find('.alert_popup');

            jTitle.html(parameterMap['title']);
            jMessage.html(parameterMap['message']);

            var image = parameterMap['image'];
            if ( image != undefined ) {
                jImageContainer.show().append($('<img />').attr('src', image));
            }

            var confirmFunction = parameterMap['confirm'];
            if (confirmFunction == false) {
                jConfirm.hide();
            }

            var cancelFunction = parameterMap['cancel'];
            if (cancelFunction == undefined) {
                jCancel.hide();
            }

            var confirmText = parameterMap['confirmText'];
            if ( confirmText == undefined ) {
                confirmText = Lia.Strings.getString(Lia.Strings.BUTTON.OK);
            }

            var cancelText = parameterMap['cancelText'];
            if ( cancelText == undefined ) {
                cancelText = Lia.Strings.getString(Lia.Strings.BUTTON.CANCEL);
            }

            var object = parameterMap['object'];
            if (confirmFunction != false) {

                jConfirm.text(confirmText).show().off('click').on('click', {
                    confirmFunction : confirmFunction,
                    object : object,
                    popup : popup
                }, function (e) {
                    var data = e.data;
                    var confirmFunction = data['confirmFunction'];
                    var object = data['object'];
                    var popup = data['popup'];

                    var hidePopup = true;
                    if ( typeof confirmFunction == 'function' ) {
                        hidePopup = confirmFunction.call(popup, object);
                        if ( hidePopup == undefined ) {
                            hidePopup = true;
                        }
                    }

                    if ( hidePopup == true ) {
                        popup.hide();
                    }
                });
            }

            if(cancelFunction != undefined && cancelFunction != false) {

                jCancel.text(cancelText).show().off('click').on('click', {
                    cancelFunction : cancelFunction,
                    object : object,
                    popup : popup
                }, function (e) {
                    var data = e.data;
                    var cancelFunction = data['cancelFunction'];
                    var object = data['object'];
                    var popup = data['popup'];

                    var hidePopup = true;
                    if ( typeof cancelFunction == 'function' ) {
                        hidePopup = cancelFunction.call(popup, object);
                        if ( hidePopup == undefined ) {
                            hidePopup = true;
                        }
                    }

                    if ( hidePopup == true ) {
                        popup.hide();
                    }
                });
            } else {
                jConfirm.css('width','100%');
            }


            var inputList = parameterMap['inputList'];
            if (inputList != undefined && inputList.length > 0) {

                jPopup.addClass('alert_popup_type_input_list');
                jInputList.show();

                for (var i = 0, l = inputList.length; i < l; i++) {

                    var item = inputList[i];

                    var addClass = item['addClass'];
                    var placeholder = item['placeholder'];
                    var type = Lia.pd('text', item['type']);
                    var value = Lia.pd('', item['value']);

                    var jItem = $('<div>' +
                            '<input class="alert_popup_input ' + addClass + '" type="' + type + '" placeholder="' + placeholder + '" value="'+value+'" />' +
                        '</div>');

                    jInputList.append(jItem);

                    // 마지막 항목에 enter 일때 엔터키 체크
                    if ( i == l - 1 ) {

                        jItem.find('input').on('keypress', function(e) {

                            if (e.which == Lia.KeyCode.ENTER) {
                                popup.find('.alert_popup_confirm_button').trigger('click');
                            }
                        });
                    }
                }
            }


            var buttonList = parameterMap['buttonList'];
            if ( buttonList != undefined ) {

                for ( var i = 0, l = buttonList.length; i < l; i++ ) {

                    var button = buttonList[i];
                    var jAlertButtons = popup.find('.alert_popup_buttons');

                    var jButton = jQuery('<div class="alert_popup_button alert_confirm_button"></div>');
                    jButton.text(button['text']).on('click', {
                        onClick : button['onClick'],
                        object : object,
                        popup : popup
                    }, function (e) {
                        var data = e.data;
                        var onClick = data['onClick'];
                        var object = data['object'];
                        var popup = data['popup'];

                        var hidePopup = true;
                        if ( typeof onClick == 'function' ) {
                            hidePopup = onClick.call(popup, object);
                            if ( hidePopup == undefined ) {
                                hidePopup = true;
                            }
                        }

                        if ( hidePopup == true ) {
                            popup.hide();
                        }
                    });

                    var color = button['color'];
                    if ( color != undefined ) {
                        jButton.css('background-color', color);
                    }

                    jAlertButtons.prepend(jButton);
                }

            }

            var init = parameterMap['init'];
            if ( init != undefined ) {
                init.call(popup, object);
            }
        },
        onShow: function (jLayout, path, parameterMap, jPopupListLayout) {

            var popup = this;

            if(!Lia.isMobile) {

                popup.find('.alert_popup_focus').focus();

                popup.find('.alert_popup_focus').on('keyup', {
                    popup : popup
                }, function(e){

                    var popup = e.data.popup;

                    if(e.keyCode == Lia.KeyCode.ENTER) {
                        popup.find('.alert_popup_confirm_button').trigger('click');
                    }
                });
            }
        },
        onHide: function (jLayout, path, parameterMap, jPopupListLayout) {
        }
    };
})();

