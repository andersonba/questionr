questionr
=========

A framework to make it easy for developers to add questionnaire to their pages.
Inspired by LinkedIn.

![Preview questionr](http://andersonba.com/questionr/questionr.jpg)

Check out the [examples](http://www.andersonba.com/questionr).

#### Code example

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
