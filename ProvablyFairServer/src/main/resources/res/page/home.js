(function () {

    return {

        onInit: function (j) {

            var page = this;

            var container = new Triton.Container({
                appendTo : j
            });

            var title = new Triton.Title({
                appendTo : container,
                content : 'Provably Fair'
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
                    })
                ]
            });

            fieldWrite.apply();

            var centerButtonSection = new Triton.CenterButtonSection({
               appendTo : container
            });

            centerButtonSection.appendToCenter(new Triton.FlatButton({
                content : 'Generate',
                onClick : function() {


                    var parameterMap = fieldWrite.extract();

                    console.log(parameterMap);

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
