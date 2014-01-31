var test;

(function(context, namespace) {

    var Questionr,
        QuestionrI18N,
        customI18N,
        defaultOpts,
        callbacks,
        utils,
        winQuestionr = context[namespace];

    if (typeof window.jQuery === undefined) throw 'jQuery was not found';

    defaultOpts = {
        showClose: true
    };

    // Questionr already exists
    if (winQuestionr) return;

    callbacks = {
        start: [],
        changeStep: [],
        end: [],
        close: []
    };

    QuestionrI18N = {
        skipBtn: 'Skip',
        doneBtn: 'Done',
        closeTooltip: 'Close'
    };

    customI18N = {};

    utils = {
        getI18NString: function(key) {
            return customI18N[key] || QuestionrI18N[key];
        },
        invokeCallbackArray: function(arr) {
            if ($.isArray(arr))
                for (i = 0, len = arr.length; i < len; ++i)
                    utils.invokeCallback(arr[i]);
        },
        invokeCallback: function(cb) {
            if (typeof cb === 'function')
                return cb();
            else if (typeof cb === 'object') // assuming array
                return utils.invokeCallbackArray(cb);
        },
        invokeEventCallbacks: function(evtType, stepCb) {
            var cbArr = callbacks[evtType],
                i,
                len;

            if (stepCb)
                return this.invokeCallback(stepCb);

            for (i = 0, len = cbArr.length; i < len; ++i)
                this.invokeCallback(cbArr[i].cb);
        },
        valOrDefault: function(val, valDefault) {
          return typeof val !== undefined ? val : valDefault;
        }
    };

    QuestionrBoard = function(opt) {
        var el;

        this.init(opt);
    };

    QuestionrBoard.prototype = {
        _inputOptions: function(type, obj) {
            if (!(/radio|checkbox/).test(type)) return;
            var i,
                len,
                list = $('<ul></ul>');

            for (i = 0, len = obj.options.length; i < len; i++) {
                var option = obj.options[i];
                var item = $('<li><label><input name="' + obj.name + '" type="' + type + '" value="' + option.value + '"> ' + (option.title || option.value) + '</label></li>');
                if (typeof option.hint === 'string')
                    item.append(this._hint(option.hint));
                list.append(item);
            }
            return list;
        },
        _textarea: function(obj) {
            var required = (obj.required !== undefined) ? 'required' : '';
            var item = $('<fieldset><textarea name="' + obj.name + '" ' + required + '></textarea></fieldset>');
            if (typeof obj.hint === 'string')
                item.append(this._hint(obj.hint));
            return item;
        },
        _text: function(obj) {
            var required = (obj.required !== undefined) ? 'required' : '';
            var item = $('<fieldset><input name="' + obj.name + '" type="text" ' + required + '></fieldset>');
            if (typeof obj.hint === 'string')
                item.append(this._hint(obj.hint));
            return item;
        },
        _checkbox: function(obj) {
            return this._inputOptions('checkbox', obj);
        },
        _radio: function(obj) {
            return this._inputOptions('radio', obj);
        },
        _select: function(obj) {
            var required = (obj.required !== undefined) ? 'required' : '',
                i,
                len,
                select = $('<select name="' + obj.name + '" ' + required + '></select>'),
                fieldset = $('<fieldset></fieldset>');

            for (i = 0, len = obj.options.length; i < len; i++) {
                var option = obj.options[i];
                var item = $('<option value="' + option.value + '">' + (option.title || option.value) + '</option>');
                select.append(item);
            }
            fieldset.append(select);
            if (typeof obj.hint === 'string')
                fieldset.append(this._hint(obj.hint));
            return fieldset;
        },
        _hint: function(text) {
            return $('<span class="info" title="' + text + '"><span class="icon-info"><span>?</span></span></span>');
        },
        _component: function(options) {
            var input,
            groupEl = $('<div class="fieldgroup"></div>');

            if (options.title !== undefined)
                groupEl.append('<p>' + options.title + '</p>');

            var inputTypes = {
                textarea: '_textarea',
                text: '_text',
                checkbox: '_checkbox',
                radio: '_radio',
                select: '_select'
            };
            var dispatcher = (typeof this[inputTypes[options.type]] === 'function') ? this[inputTypes[options.type]] : null;

            if (dispatcher) {
                input = dispatcher.call(this, options);
                groupEl.append(input);
            } else throw 'Input type "' + options.type + '" was not found';

            return groupEl;
        },
        _renderComponents: function(arr) {
            // assuming one component (no-array)
            if (typeof arr === 'object' && !$.isArray(arr))
                return this._component(arr);

            var i,
                len,
                compsEl;

            for (i = 0, len = arr.length; i < len; i++) {
                if (!compsEl)
                    compsEl = this._component(arr[i]);
                else
                    compsEl.append(this._component(arr[i]));
            }
            return compsEl;
        },
        _closeBtn: function() {
            var self = this;
            var btn = $('<a href="#" class="close-action" title="' + utils.getI18NString('closeTooltip') + '">' + utils.getI18NString('closeTooltip') + '</a>');
            btn.on('click', function(e) {
                e.preventDefault();
                self.hide(true);
            });
            return btn;
        },
        init: function(initOpt) {
            $target = (typeof initOpt.target === 'object') ? initOpt.target : $(initOpt.target);

            if (!$target.length) throw 'Target element was not found';

            el = $('<div class="questionr board"><div class="questionr-container"></div></div>');

            // showClose
            if (getOption('showClose') === true)
                el.prepend(this._closeBtn());

            $target.append(el);
        },
        render: function(step, idx) {
            $container = el.find('> .questionr-container').first();

            var stepEl = $('<div class="questionr-step" data-step-id="' + idx + '"></div>');
            var formEl = $('<div class="form"></div>');
            var actsEl = $('<div class="actions-wrapper"></div>');

            // title & description
            if (step.title !== undefined)
                formEl.append($('<span class="title">' + step.title + '</span>'));
            if (step.description !== undefined)
                formEl.append($('<span class="description">' + step.description + '</span>'));

            // components
            var compsEl = this._renderComponents(step.form);
            formEl.append(compsEl);

            // actions wrapper
            var actBtnEl = $('<button type="button" class="action">' + utils.getI18NString('doneBtn') + '</button>');
            actsEl.append(actBtnEl);
            if (step.showSkip === true)
                actsEl.append($('<button type="button" class="skip">' + utils.getI18NString('skipBtn') + '</button>'));
            formEl.append(actsEl);

            stepEl.append(formEl);

            $container.html(stepEl);
        },
        show: function() {
            el.fadeIn(200);
        },
        hide: function(destroy) {
            var self = this;
            el.fadeOut(200, function() {
                if (destroy) self.destroy();
            });
        },
        destroy: function() {
            el.remove();
        }
    };

    Questionr = function() {
        var currQuestionnaire,
            board,
            opt,
            _configure;

        /**
         * Function for retrieving or creating board object
         * @return {Object} QuestionrBoard
         */
        getBoard = function() {
            if (!board) board = new QuestionrBoard(opt);
            return board;
        };

        /**
         * Method for getting an option. Returns custom config option
         * or default config option if no custom value exists.
         * @param  {String} name config option name
         * @return {Object}      config option value
         */
        getOption = function(name) {
            if (typeof opt === undefined)
                return defaultOpts[name];
            return utils.valOrDefault(opt[name], defaultOpts[name]);
        };

        /**
         * Loads, but does nt display, questionnaire
         * @param  {Object} questionnaire The questionnaire JSON object
         * @return {Object}               Questionr
         */
        loadQuestionnaire = function(questionnaire) {
            var tmpOpt = {},
                prop;

            // Set questionnaire-specific configurations
            for (prop in questionnaire) {
                if (questionnaire.hasOwnProperty(prop) &&
                    prop !== 'id' && prop !== 'steps')
                    tmpOpt[prop] = questionnaire[prop];
            }

            _configure.call(this, tmpOpt);

            return this;
        };

        /**
         * Begins questionnaire
         * @param  {Object} questionnaire The questionnaire JSON object
         * @param  {Function} cb          The callback to add on start
         * @return {Object}               Questionr
         */
        this.start = function(questionnaire, cb) {
            var board,
                firstStep;

            // loadQuestionnaire if we are calling `start` directly.
            if (!currQuestionnaire) {
                currQuestionnaire = questionnaire;
                loadQuestionnaire.call(this, questionnaire);
            }

            // adds onEnd callback (shortcut)
            if (typeof cb === 'function') this.listen('end', cb);

            utils.invokeEventCallbacks('start');

            board = getBoard();

            // finds first step
            if (currQuestionnaire.steps[0] === undefined) throw 'Step was not found';
            firstStep = currQuestionnaire.steps[0];

            // render & show
            board.render(firstStep, 0);
            board.show();

            return this;
        };

        /**
         * Ends questionnaire
         * @return {Object} Questionr
         */
        this.end = function() {
            utils.invokeEventCallbacks('end');
        };

        /**
         * Jumps to a specific step in questionnaire
         * @param  {Number} stepNum The step number to jump
         * @return {Object}         Questionr
         */
        this.jumpToStep = function(stepNum) {
            return this;
        };

        /**
         * Gets the answer from last step
         * @return {Object} The answer JSON object
         */
        this.getLastAnswer = function() {

        };

        /**
         * Gets the currently loaded questionnaire
         * @return {Object} Questionnaire
         */
        this.getCurrQuestionnaire = function() {
            return currQuestionnaire;
        };

        /**
         * Gets the target object of the currently running questionnaire
         * @return {Object} The currently step JSON object
         */
        this.getCurrStep = function() {

        };

        /**
         * Gets the zero-based step number of the currently running questionnaire
         * @return {Number} The currently step number
         */
        this.getCurrStepNum = function() {

        };

        /**
         * Gets the target object of step
         * @param  {Number} stepNum The step number
         * @return {Object}         The specific step JSON object
         */
        this.getStep = function(stepNum) {

        };

        /**
         * Gets serialized data of answers
         * @return {Object} The serialized data
         */
        this.getData = function() {

        };

        /**
         * Adds callback for event types
         * @param  {String}   evtType   "start", "end"
         * @param  {Function} cb        The callback to add
         * @return {Object}             Questionr
         */
        this.listen = function(evtType, cb) {
            if (evtType)
                callbacks[evtType].push({ cb: cb });
            return this;
        };

        /**
         * Removes callback for event types
         * @param  {String}   evtType "start", "end"
         * @param  {Function} cb      The callback to remove
         * @return {Object}           Questionr
         */
        this.unlisten = function(evtType, cb) {
            var evtCallbacks = callbacks[evtType],
                i,
                len;

            for (i = 0, len = evtCallbacks.length; i < len; ++i)
                if (evtCallbacks[i] === cb)
                    evtCallbacks.splice(i, 1);
            return this;
        };

        /**
         * Resets all configurations options to default
         * @return {Object} Questionr
         */
        this.resetDefaultOptions = function() {
            opt = {};
            return this;
        };

        /**
         * See @this.configure
         * @param  {Object} options
         * @return {Object}         Questionr
         */
        _configure = function(options) {
            var events = ['start', 'end'],
                i;

            if (!opt)
                this.resetDefaultOptions();

            $.extend(opt, options);

            if (options)
                $.extend(customI18N, options.i18n);

            for (i = 0, len = events.length; i < len; ++i) {
                eventPropName = 'on' + events[i].charAt(0).toUpperCase() + events[i].substring(1);
                if (options[eventPropName]) {
                    this.listen(events[i], options[eventPropName]);
                }
            }

            return this;
        };

        /**
         * Sets options for running questionnaire.
         * Note: If this method is called after loading a questionnaire, the options specified will override the options definied in the questionnaire
         * @param  {Object} options The custom options
         * @return {Object}      Questionr
         */
        this.configure = function(options) {
            return _configure.call(this, options);
        };

    };

    winQuestionr = new Questionr();
    context[namespace] = winQuestionr;

}(window, 'questionr'));
