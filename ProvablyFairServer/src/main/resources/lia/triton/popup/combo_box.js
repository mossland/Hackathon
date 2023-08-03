(function () {

    return {

        cssLoading: false,
        htmlLoading: false,
        typeCode: undefined,

        onConstruct: function (jLayout, path, object, jPopupListLayout) {

            var popup = this;
            Triton.PopupHelper.appendLayout(popup, {
                title: ''
            });
        },

        onInit: function (jLayout, path, object, jPopupListLayout) {

            var popup = this;

            var jPopupContent = popup.find('.popup_content');

            var section = new Triton.Section({
                appendTo: jPopupContent
            });

            var searchPanel = new Triton.Panel({
                appendTo: section
            });

            var searchTable = new Triton.DetailTable({
                appendTo: searchPanel
            });

            searchTable.appendRow({});
            searchTable.appendKeyColumn({
                content: Lia.Strings.getString(Lia.Strings.BOARD.SEARCH),
                css: {width: '100px'}
            });
            searchTable.appendValueColumn({
                content: popup.textInput = new Triton.TextInput({
                    onInput: function (e) {
                        popup.change(1, true);
                    }
                })
            });

            popup.listPanel = new Triton.Panel({
                css: {'margin-top': '10px'},
                appendTo: section
            });

            var comboBox = popup.comboBox = Lia.p(object, 'comboBox');
            var onSelected = Lia.p(object, 'onSelected');

            var list = popup.list = [];
            var jOption = comboBox.find('option');

            if (jOption.length > 0) {

                for (var i = 0, l = jOption.length; i < l; i++) {

                    var option = jOption.eq(i).data('triton-combo-box-option');
                    list.push(option);
                }
            }

            popup.onSelected = Lia.p(object, 'onSelected');
            popup.change(1, true);

        },

        change: function (page, refresh) {

            var popup = this;
            var searchKeyword = popup.textInput.getValue();
            var tableColumns = popup.comboBox.getTableColumns();

            var searched = popup.searched;
            if (refresh) {

                if (String.isNotBlank(searchKeyword)) {

                    searched = [];

                    if (popup.list != undefined && popup.list.length > 0) {

                        for (var i = 0, l = popup.list.length; i < l; i++) {

                            var item = popup.list[i];
                            // 테이블 표시 컬럼에 따라 검색 방법 다름
                            if (tableColumns == undefined) {

                                var subItem = item['item'];
                                var name = item['name'];

                                if (subItem != undefined) {

                                    var subItemName = subItem['name'];

                                    if (String.isNotBlank(subItemName)) {
                                        name = subItemName;
                                    } else {
                                        name = subItem['service_title'];
                                    }

                                }

                                if (name != undefined && name.indexOf(searchKeyword) >= 0) {
                                    searched.push(item);
                                }

                            } else {

                                var excluded = false;
                                for (var j = 0, jl = tableColumns.length; j < jl; j++) {

                                    var tableColumn = tableColumns[j];
                                    var tableColumnKey = tableColumn['key'];
                                    var tableColumnValue = item[tableColumnKey];
                                    var tableColumnExcludeWhenBlank = tableColumn['excludeWhenBlank'];

                                    if (tableColumnExcludeWhenBlank == true && String.isBlank(tableColumnValue)) {
                                        excluded = true;
                                        break;
                                    }
                                }

                                if (!excluded) {

                                    for (var j = 0, jl = tableColumns.length; j < jl; j++) {

                                        var tableColumn = tableColumns[j];
                                        var tableColumnKey = tableColumn['key'];
                                        var tableColumnValue = item[tableColumnKey];
                                        if (tableColumnValue != undefined && tableColumnValue.indexOf(searchKeyword) >= 0) {
                                            searched.push(item);
                                            break;
                                        }
                                    }
                                }

                            }
                        }
                    }

                } else {

                    var tableColumns = popup.comboBox.getTableColumns();
                    if (tableColumns == undefined) {
                        searched = popup.list;
                    } else {

                        searched = [];
                        if (popup.list != undefined && popup.list.length > 0) {

                            for (var i = 0, l = popup.list.length; i < l; i++) {

                                var item = popup.list[i];
                                var excluded = false;
                                for (var j = 0, jl = tableColumns.length; j < jl; j++) {

                                    var tableColumn = tableColumns[j];
                                    var tableColumnKey = tableColumn['key'];
                                    var tableColumnValue = item[tableColumnKey];
                                    var tableColumnExcludeWhenBlank = tableColumn['excludeWhenBlank'];

                                    if (tableColumnExcludeWhenBlank == true && String.isBlank(tableColumnValue)) {
                                        excluded = true;
                                        break;
                                    }
                                }

                                if (!excluded) {
                                    searched.push(item);
                                }
                            }
                        }
                    }
                }

                popup.searched = searched;
            }

            popup.listPanel.empty();

            Requester.func(function () {

                if (searched.length > 0) {

                    var listTable = new Triton.ListTable({
                        appendTo: popup.listPanel
                    });

                    listTable.appendHeaderRow({});

                    if (tableColumns == undefined) {

                        listTable.appendHeaderColumn({
                            content: Lia.Strings.getString(Lia.Strings.BOARD.SEARCH_RESULT)
                        });

                    } else {

                        for (var i = 0, l = tableColumns.length; i < l; i++) {

                            var tableColumn = tableColumns[i];
                            var tableColumnName = tableColumn['name'];

                            listTable.appendHeaderColumn({
                                content: tableColumnName
                            });
                        }
                    }

                    var count = 15;
                    for (var i = ( ( page - 1) * count),
                             l = Math.min(page * count, searched.length);
                         i < l; i++) {

                        var item = searched[i];

                        listTable.appendRow({

                            item: item,

                            onClick: function (e) {

                                var item = e.data.item;

                                if (popup.onSelected != undefined) {
                                    popup.onSelected(popup.comboBox, item['value']);
                                }

                                popup.hide();
                            }
                        });


                        if (tableColumns == undefined) {

                            var title = item['name'];

                            if (String.isBlank(title)) {
                                title = item['service_title'];
                            }

                            listTable.appendColumn({
                                content: title
                            });

                        } else {

                            for (var j = 0, jl = tableColumns.length; j < jl; j++) {

                                var tableColumn = tableColumns[j];
                                var tableColumnKey = tableColumn['key'];
                                var tableColumnValue = item[tableColumnKey];

                                listTable.appendColumn({
                                    content: tableColumnValue
                                });
                            }

                        }
                    }

                } else {

                    new Triton.Section({
                        appendTo: popup.listPanel,
                        theme: Triton.Section.Theme.ListMessage,
                        content: '표시할 항목이 없습니다.'
                    });


                }


                var pagerSection = new Triton.Section({
                    appendTo: popup.listPanel,
                    theme: Triton.Section.Theme.Pager
                });

                new Triton.Pager({
                    appendTo: pagerSection,
                    'pageNumber': page,
                    'countPerPage': count,
                    'totalCount': searched.length,
                    'onPageSelected': function (pageNumber) {
                        popup.change(pageNumber);
                    }
                });

            });

        },

        onShow: function (jLayout, path, parameterMap, jPopupListLayout) {

        },
        onHide: function (jLayout, path, parameterMap, jPopupListLayout) {
        }
    };
})();

