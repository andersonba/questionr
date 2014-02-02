/**
 * EXAMPLE
 *
 * Rangobox's feedback
 * www.rangobox.com.br
 */

var feedback = {
    id: 'example1',
    target: '#example1',
    steps: [
        // 0
        {
            title: 'Você recebeu o prato agendado?',
            description: 'Macarrão ao Vivo - Spolleto',
            form: [
                {
                    name: 'received',
                    type: 'radio',
                    options: [
                        {
                            title: 'Sim',
                            value: 'yes'
                        },
                        {
                            title: 'Não',
                            value: 'no'
                        }
                    ]
                }
            ],
            onDone: function() {
                if (questionr.getAnswer('received') === 'yes')
                    questionr.jumpToStep(2);
            }
        },
        // 1
        {
            title: 'O fornecedor informou o cancelamento?',
            form: [
                {
                    name: 'supplier_make_contact',
                    type: 'radio',
                    options: [
                        {
                            title: 'Sim',
                            value: 'yes'
                        },
                        {
                            title: 'Não',
                            value: 'no'
                        }
                    ]
                }
            ],
            onDone: function() {
                questionr.jumpToStep(3);
            }
        },
        // 2
        {
            title: 'O prato chegou a tempo ou atrasado para o almoço?',
            form: [
                {
                    name: 'arrived_on_time',
                    type: 'radio',
                    options: [
                        {
                            title: 'Sim, chegou a tempo!',
                            value: 'yes'
                        },
                        {
                            title: 'Não, fiquei com fome.',
                            value: 'no'
                        }
                    ]
                }
            ]
        },
        // 3
        {
            title: 'Dê uma nota para o Spolleto',
            description: 'De 0 à 5',
            form: [
                {
                    name: 'rate',
                    type: 'select',
                    required: false,
                    options: [
                        { value: 0 }, { value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }, { value: 5 }
                    ]
                }
            ]
        },
        // 4
        {
            title: 'Obrigado!',
            description: 'Seu feedback é muito importante para nós.',
            showDone: false,
            showSkip: false,
            showExtra: true,
            extraBtn: 'Fechar',
            extraBtnStyle: 'done',
            onShow: function() {
                questionr.end(false);
            },
            onExtra: function() {
                questionr.destroy();
            }
        }
    ],
    onStart: function() {
        console.log('Starting questionr...');
    },
    onEnd: function() {
        console.log('Ending questionr...');
    },
    i18n: {
        skipBtn: 'Pular',
        doneBtn: 'Salvar',
        closeTooltip: 'Sair',
        selectText: 'Por favor, selecione'
    }
};


// execute questionnaire passing onEnd callback
questionr.start(feedback, function() {
    // get data from questionnaire
    var data = questionr.getData();
    console.log('Feedback enviado com sucesso.');
    console.log('Result:');
    console.log(data);
});
