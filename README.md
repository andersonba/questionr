questionr
=========

A framework to make it easy for developers to add questionnaire (like linkedin) to their pages.

![Preview questionr](http://andersonba.com/questionr/questionr.jpg)

    var example = {
        target: '#example',
        steps: [
            {
                title: "Hi, I'm a Questionr.",
                description: 'Easy, simple and fun!',
                form: {
                    name: 'input-name',
                    type: 'radio',
                    options: [
                        {
                            title: 'Make your questionnaire...',
                            value: 'input-value'
                        }
                        ...
                    ]
                }
            }
            ...
        ]
    };
    
    questionr.start(example);
