var questionnaire = {
    id: 'example2',
    target: '#example2',
    showClose: true,
    steps: [
        {
            title: 'Hello, who are you?',
            description: 'Enter your informations bellow',
            showSkip: true,
            form: [
                {
                    title: "What's your name?",
                    name: 'name',
                    hint: 'Please, your full name',
                    type: 'text'
                },
                {
                    title: "What's your gender?",
                    name: 'gender',
                    type: 'radio',
                    options: [
                        {
                            title: 'Male',
                            hint: 'Are you sure?',
                            value: 'M'
                        },
                        {
                            title: 'Famale',
                            value: 'F'
                        }
                    ]
                },
                {
                    title: 'Select your country',
                    name: 'country',
                    type: 'select',
                    options: [
                        {
                            title: 'Brazil',
                            value: 'BR',
                            selected: true
                        },
                        {
                            title: 'Other',
                            value: 'other'
                        }
                    ]
                },
                {
                    title: "Do you have...",
                    name: 'social',
                    type: 'checkbox',
                    options: [
                        {
                            title: 'Facebook',
                            value: 'facebook'
                        },
                        {
                            title: 'Twitter',
                            value: 'twitter'
                        },
                        {
                            title: 'Google+',
                            value: 'google-plus'
                        }
                    ]
                },
                {
                    title: 'Rate us',
                    name: 'rate',
                    type: 'select',
                    options: [
                        { value: 0 }, { value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }, { value: 5 }
                    ]
                }
            ]
        },
        {
            title: 'Do you like this?',
            form: [
                {
                    name: 'liked',
                    type: 'radio',
                    options: [
                        {
                            title: 'Yes',
                            value: 'yes'
                        },
                        {
                            title: 'No',
                            value: 'no'
                        }
                    ]
                }
            ]
        }
    ]
};


// execute questionnaire passing onEnd callback
questionr.start(questionnaire, function() {

    // get data from questionnaire
    var data = questionr.getData();
    // submit data by ajax
    $.post('//url_to_save_feedback', data)
    .done(function() {
        alert('Questionnaire finished');
    });

});
