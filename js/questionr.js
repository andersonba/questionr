(function(context, namespace) {

    var Questionr,
        QuestionrI18N,
        customI18N,
        defaultOpts,
        callbacks,
        utils,
        winQuestionr = context[namespace],
        document = window.document;

    defaultOpts = {
        showClose: true
    };

    // Questionr already exists
    if (winQuestionr) return;

    callbacks = {
        start: [],
        end: []
    };

    QuestionrI18N = {
        skipBtn: 'Skip',
        doneBtn: 'Done',
        closeTooltip: 'Close'
    };

    customI18N = {};

    utils = {
        extend: function(obj1, obj2) {
            var prop;
            for (prop in obj2) {
                if (obj2.hasOwnProperty(prop)) {
                    obj1[prop] = obj2[prop];
                }
            }
        },
        getI18NString: function(key) {
            return customI18N[key] || QuestionrI18N[key];
        },
        addEvtListener: function(el, evtName, fn) {
            return el.addEventListener ? el.addEventListener(evtName, fn, false) : el.attachEvent('on' + evtName, fn);
        },
        removeEvtListener: function(el, evtName, fn) {
            return el.removeEventListener ? el.removeEventListener(evtName, fn, false) : el.detachEvent('on' + evtName, fn);
        },
        invokeCallback: function(cb) {
            if (typeof cb === 'function')
                return cb();
            if (typeof cb !== 'string') // assuming array
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
        }
    };

    Questionr = function(initOptions) {
        var currQuestionnaire,
            opt,
            _configure;

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
            // loadQuestionnaire if we are calling `start` directly.
            if (!currQuestionnaire) {
                currQuestionnaire = questionnaire;
                loadQuestionnaire.call(this, questionnaire);
            }

            if (typeof cb === 'function') this.listen('end', cb);

            utils.invokeEventCallbacks('start');

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
         * @param  {string}   evtType   "start", "end"
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
         * @param  {string}   evtType "start", "end"
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

            utils.extend(opt, options);

            if (options)
                utils.extend(customI18N, options.i18n);

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
