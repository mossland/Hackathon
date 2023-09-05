(function () {

    return {

        onInit: function (j) {

            var page = this;

            var container = new Triton.Container({
                appendTo : j
            });

            var title = new Triton.Title({
                appendTo : container,
                content : 'Provably Fair Check',
                rightFlatButtonList : [
                    {
                        content : 'Provably Fair Generate',
                        onClick : function() {
                            PageManager.go('generate');
                        }
                    }
                ]
            });

            var fieldWrite = new Triton.FieldWrite({
                appendTo :   container,
                typeList : [

                    new Triton.Field.Type.Basic({
                        name : 'Server Seed',
                        key : 'serverSeed'
                    }),

                    new Triton.Field.Type.Basic({
                        name : 'Client Seed',
                        key : 'clientSeed'
                    }),

                    new Triton.Field.Type.Basic({
                        name : 'Nonce',
                        key : 'nonce'
                    }),

                    new Triton.Field.Type.Basic({
                        name : 'Size',
                        key : 'size'
                    }),

                    new Triton.Field.Type.Basic({
                        name : 'Result Number',
                        key : 'resultNumber'
                    })
                ]
            });

            fieldWrite.apply();

            var centerButtonSection = new Triton.CenterButtonSection({
               appendTo : container
            });

            centerButtonSection.appendToCenter(new Triton.FlatButton({
                content : 'Check',
                onClick : function() {


                    var parameterMap = fieldWrite.extract();

                    if ( String.isBlank(parameterMap['serverSeed']) ) {
                        Triton.AlertManager.alert('Input Server Seed.');
                        return;
                    }

                    if ( String.isBlank(parameterMap['clientSeed']) ) {
                        Triton.AlertManager.alert('Input Client Seed.');
                        return;
                    }

                    if ( String.isBlank(parameterMap['nonce']) ) {
                        Triton.AlertManager.alert('Input Nonce.');
                        return;
                    }

                    if ( String.isBlank(parameterMap['size']) ) {
                        Triton.AlertManager.alert('Input Size.');
                        return;
                    }

                    if ( String.isBlank(parameterMap['resultNumber']) ) {
                        Triton.AlertManager.alert('Input Result Number.');
                        return;
                    }

                    var resultNumber = parameterMap['resultNumber'];

                    Requester.awb(ApiUrl.generateResult, parameterMap, function( status, data ) {

                        if ( !status ) {
                            return;
                        }

                        var fieldDetail = new Triton.FieldDetail({
                            appendTo : page.resultSection.empty(),
                            typeList : [

                                new Triton.Field.Type.Basic({
                                    name : 'Result',
                                    key : 'result'
                                }),

                                new Triton.Field.Type.Basic({
                                    name : 'Number',
                                    key : function( item ) {

                                        var number = Lia.p(item, 'number');
                                        var resultMessage = ''
                                        var equalMessage = '';

                                        if ( number == resultNumber ) {
                                            resultMessage = 'Correct';
                                            equalMessage = ' == ';
                                        } else {
                                            resultMessage = 'Incorrect';
                                            equalMessage = ' != ';
                                        }

                                        return '<span>'+ number + equalMessage  + resultNumber + ' ( ' + resultMessage + ' ) ' +'</span>';
                                    }
                                })
                            ]
                        });

                        fieldDetail.apply(Lia.p(data,'body'))

                    });
                }
            }));


            var resultSection = page.resultSection = new Triton.Section({
                css : { 'margin-top' : '10px' },
                appendTo : container
            });

        },
        onChange: function (jPage, jPageContainer, i, parameterMap, beforeParameterMap) {

            var page =  this;

        },
        onRelease: function (j) {
        }
    };
})();
