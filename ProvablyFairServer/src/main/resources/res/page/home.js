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

                }
            }));
        },
        onChange: function (jPage, jPageContainer, i, parameterMap, beforeParameterMap) {

            var page =  this;

        },
        onRelease: function (j) {
        }
    };
})();
