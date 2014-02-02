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
        showClose: true,
        animations: true,
        animationsDelay: 200
    };

    // Questionr already exists
    if (winQuestionr) return;

    callbacks = {
        show: [],
        start: [],
        changeStep: [],
        end: [],
        hide: []
    };

    QuestionrI18N = {
        skipBtn: 'Skip',
        doneBtn: 'Done',
        extraBtn: 'Button',
        closeTooltip: 'Close',
        selectText: 'Please choose'
    };

    customI18N = {};

    utils = {
        // Returns custom i18n value or the
        // default i18n value if no custom value exists.
        getI18NString: function(key) {
            return customI18N[key] || QuestionrI18N[key];
        },
        // Invokes one or more callbacks
        invokeCallbackArray: function(arr) {
            if ($.isArray(arr))
                for (i = 0, len = arr.length; i < len; ++i)
                    utils.invokeCallback(arr[i]);
        },
        // Helper function for invoking a callback
        invokeCallback: function(cb) {
            if (typeof cb === 'function')
                return cb();
            else if (typeof cb === 'object') // assuming array
                return utils.invokeCallbackArray(cb);
        },
        // Invoking a callback by event name
        invokeEventCallbacks: function(evtType) {
            var cbArr = callbacks[evtType],
                i,
                len;

            for (i = 0, len = cbArr.length; i < len; ++i)
                this.invokeCallback(cbArr[i].cb);
        },
        // Returns val if it's defined, otherwise returns the default (inspired by python)
        valOrDefault: function(val, valDefault) {
            return typeof val !== 'undefined' ? val : valDefault;
        },
        // Unserialize string to Object
        unserialize: function(p) {
            if (!p || p === undefined) return {};
            var ret = {},
                seg = p.replace(/^\?/, '').split('&'),
                len = seg.length, i = 0, s;
            for (; i < len; i++) {
                if (!seg[i]) { continue; }
                s = seg[i].split('=');
                ret[s[0]] = s[1];
            }
            return ret;
        }
    };

    QuestionrBoard = function(opt) {
        var el;

        this.init(opt);
    };

    QuestionrBoard.prototype = {
        _form: function(step) {
            var self = this;
            var form = $('<form class="form"></form>').on('submit', function(e) {
                e.preventDefault();
                // save answers
                self._updateAnswers();
                // jump to next or finish
                questionr.jumpToNextStep();
                // onDone callback
                var cb = step.onDone;
                if (typeof cb === 'function') cb();
            });
            return form;
        },
        _closeBtn: function() {
            var self = this;
            var btn = $('<a href="#" class="close-action" title="' + utils.getI18NString('closeTooltip') + '">' + utils.getI18NString('closeTooltip') + '</a>');
            btn.on('click', function(e) {
                e.preventDefault();
                questionr.close();
            });
            return btn;
        },
        _doneBtn: function(step) {
            var btn = $('<button type="submit" class="done">' + utils.valOrDefault(step.actBtn, utils.getI18NString('doneBtn')) + '</button>');
            return btn;
        },
        _skipBtn: function(step) {
            var cb = step.onSkip;
            var btn = $('<button type="button" class="skip">' + utils.valOrDefault(step.skipBtn, utils.getI18NString('skipBtn')) + '</button>')
            .on('click', function(e) {
                // Skip, jump to next step
                questionr.jumpToNextStep();
                // onSkip callback
                if (typeof cb === 'function') cb();
            });
            return btn;
        },
        _extraBtn: function(step) {
            var cb = step.onExtra;
            var btn = $('<button type="button" class="' + utils.valOrDefault(step.extraBtnStyle, 'skip') + '">' + utils.valOrDefault(step.extraBtn, utils.getI18NString('extraBtn')) + '</button>');
            if (typeof cb === 'function')
                btn.on('click', function() {
                    // onExtra callback
                    if (typeof cb === 'function') cb();
                });
            return btn;
        },
        _inputOptions: function(type, obj) {
            if (!(/radio|checkbox/).test(type)) return;
            var i,
                len,
                list = $('<ul></ul>'),
                required = (type === 'radio' && obj.required !== false) ? 'required' : '';
            for (i = 0, len = obj.options.length; i < len; i++) {
                var option = obj.options[i];
                var checked = (option.checked === true) ? 'checked' : '';
                var item = $('<li><label><input name="' + obj.name + '" type="' + type + '" value="' + option.value + '" ' + required + ' ' + checked + '> ' + (option.title || option.value) + '</label></li>');
                if (typeof option.hint === 'string')
                    item.append(this._hint(option.hint));
                list.append(item);
            }
            return list;
        },
        _textarea: function(obj) {
            var required = (obj.required !== false) ? 'required' : '';
            var value = (obj.value !== undefined) ? obj.value : '';
            var item = $('<fieldset><textarea name="' + obj.name + '" ' + required + '>' + value + '</textarea></fieldset>');
            if (typeof obj.hint === 'string')
                item.append(this._hint(obj.hint));
            return item;
        },
        _text: function(obj) {
            var required = (obj.required !== false) ? 'required' : '';
            var value = (obj.value !== undefined) ? 'value="' + obj.value + '"' : '';
            var item = $('<fieldset><input name="' + obj.name + '" type="text" ' + required + ' ' + value + '></fieldset>');
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
            var required = (obj.required !== false) ? 'required' : '',
                empty = (obj.required === false) ? '<option value="">' + utils.getI18NString('selectText') + '</option>' : '',
                i,
                len,
                select = $('<select name="' + obj.name + '" ' + required + '>' + empty + '</select>'),
                fieldset = $('<fieldset></fieldset>');

            for (i = 0, len = obj.options.length; i < len; i++) {
                var option = obj.options[i];
                var selected = (option.selected === true) ? 'selected' : '';
                var item = $('<option value="' + option.value + '" ' + selected + '>' + (option.title || option.value) + '</option>');
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
                inputTypes = {
                    textarea: '_textarea',
                    text: '_text',
                    checkbox: '_checkbox',
                    radio: '_radio',
                    select: '_select'
                },
                groupEl = $('<div class="fieldgroup"></div>');

            if (options.title !== undefined)
                groupEl.append('<p>' + options.title + '</p>');

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
        _updateAnswers: function() {
            var form = el.find('form');
            questionr.setData(form.serializeArray());
        },
        init: function(initOpt) {
            var target = (typeof initOpt.target === 'object') ? initOpt.target : $(initOpt.target);

            if (!target.length) throw 'Target element was not found';

            el = $('<div class="questionr board"><div class="questionr-container"></div></div>');

            // showClose
            if (getOption('showClose') === true)
                el.prepend(this._closeBtn());

            target.append(el);
        },
        render: function(step, idx) {
            var container = el.find('> .questionr-container').first();
            var stepEl = $('<div class="questionr-step" data-step-id="' + idx + '"></div>');
            var formEl = this._form(step);
            var actsEl = $('<div class="actions-wrapper"></div>');

            // title & description
            if (step.title !== undefined)
                formEl.append($('<span class="title">' + step.title + '</span>'));
            if (step.description !== undefined)
                formEl.append($('<span class="description">' + step.description + '</span>'));

            // components
            if (step.form !== undefined) {
                var compsEl = this._renderComponents.call(this, step.form);
                formEl.append(compsEl);
            }

            // done
            if (step.showDone !== false)
                actsEl.append(this._doneBtn(step));
            // skip
            if (step.showSkip === true)
                actsEl.append(this._skipBtn(step));
            // extra
            if (step.showExtra === true)
                actsEl.append(this._extraBtn(step));

            // actions wrapper
            formEl.append(actsEl);

            stepEl.append(formEl);
            container.html(stepEl);

            // currStepNum
            questionr.setCurrStep(idx);

            // onShow
            if (typeof step.onShow === 'function') step.onShow();
        },
        show: function() {
            if (getOption('animations'))
                el.fadeIn(getOption('animationsDelay'));
            else
                el.show(0);
            utils.invokeEventCallbacks('show');
        },
        hide: function(destroy) {
            var self = this;
            if (getOption('animations'))
                el.fadeOut(200, function() {
                    if (destroy) self.destroy();
                });
            else {
                el.hide(0);
                self.destroy();
            }
            utils.invokeEventCallbacks('hide');
        },
        destroy: function() {
            el.remove();
        }
    };

    Questionr = function() {
        var currQuestionnaire,
            currStepNum,
            answers = [],
            board,
            opt,
            postDispatcher,
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
        this.end = function(animate) {
            utils.invokeEventCallbacks('end');
            if (animate !== false)
                board.hide(true);
            return this;
        };

        /**
         * Destroys board
         * @return {Object} Questionr
         */
        this.close = function() {
            board.hide(true);
            return this;
        };

        /**
         * Jumps to a specific step in questionnaire
         * @param  {Number} stepNum The step number to jump
         * @return {Object}         Questionr
         */
        this.jumpToStep = function(stepNum) {
            var step = currQuestionnaire.steps[stepNum];

            if (step === undefined) throw 'Step was not found';

            // render
            board.render(step, stepNum);
            utils.invokeEventCallbacks('changeStep');
            return this;
        };


        /**
         * Jumps to a next step in questionnaire
         * @return {Object}         The next step JSON object
         */
        this.jumpToNextStep = function() {
            try {
                return this.jumpToStep(currStepNum + 1);
            } catch (e) {
                this.end();
            }
        };

        /**
         * Gets the answer, if it already was answered
         * @param  {String} key The field in last step
         * @return {Object}     The answers JSON object
         */
        this.getAnswer = function(key) {
            var answersObj = utils.unserialize(this.getData());
            return utils.valOrDefault(answersObj[key], false);
        };

        /**
         * Gets the currently loaded questionnaire
         * @return {Object} Questionnaire
         */
        this.getCurrQuestionnaire = function() {
            return currQuestionnaire;
        };

        /**
         * Sets the currently running step
         * @return {Object} Questionr
         */
        this.setCurrStep = function(stepNum) {
            currStepNum = stepNum;
            return this;
        };

        /**
         * Gets the target object of the currently running step
         * @return {Object} The currently step JSON object
         */
        this.getCurrStep = function() {
            return this.getStep(currStepNum);
        };

        /**
         * Gets the zero-based number of the currently running step
         * @return {Number} The currently step number
         */
        this.getCurrStepNum = function() {
            return currStepNum;
        };

        /**
         * Gets the target object of step
         * @param  {Number} stepNum The step number
         * @return {Object}         The specific step JSON object
         */
        this.getStep = function(stepNum) {
            if (stepNum === undefined) throw 'Enter the step number param';
            var step = currQuestionnaire.steps[stepNum];
            if (step === undefined) throw 'Step was not found';
            return step;
        };

        /**
         * Sets serialized data of answers
         * @param {String}  data Data serialized
         * @return {Object}      Questionr
         */
        this.setData = function(data) {
            var old = answers;
            answers = $.merge(data, old);
            return this;
        };

        /**
         * Gets serialized data of answers
         * @return {String} The serialized data
         */
        this.getData = function(obj) {
            if (obj) return answers;
            if (typeof answers === 'undefined') return false;
            return $.param(answers);
        };

        /**
         * Enables autosave to post data on changeStep fired
         * @return {Object} Questionr
         */
        this.autosave = function(val) {
            var self = this;
            if (postDispatcher === undefined) throw 'Post method was not defined';
            this.listen('changeStep', function() {
                postDispatcher();
            });
            return this;
        };


        /**
         * HELPER: Submits data serialized to url by ajax
         * @return {Object} Questionr
         */
        this.post = function(url, cb) {
            postDispatcher = function() {
                $.post(url, data)
                .done(function() {
                    // post callback
                    if (typeof cb === 'function') cb();
                });
            };
            var data = this.getData();
            this.listen('end', function() {
                postDispatcher();
            });
            return this;
        };

        /**
         * Adds callback for event types
         * @param  {String}   evtType   "show", "start", "changeStep", "end", "hide"
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
         * @param  {String}   evtType "show", "start", "changeStep", "end", "hide"
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
            var events = ['start', 'show', 'changeStep', 'end', 'hide'],
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
         * Note: If this method is called after loading a questionnaire, the options specified will override the options defined in the questionnaire
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
