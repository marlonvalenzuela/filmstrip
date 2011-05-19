(function ($) {
    /**
    * Plugin generator plugin. Doesn't allow for chaining, but preserves public
    * methods and namespaces, and supports multiple elements.
    * @author Jamie Talbot
    **/
    $.fn.encapsulatedPlugin = function (plugin, Definition, objects, options) {
        //Creates a function that calls the function of the same name on each member of the supplied set.  function makeIteratorFunction(f, set) {
        function makeIteratorFunction(f, set) {
            return function () {
                var result = [];
                for ( var i = 0; i < set.length; i++) {
                    result.push(set[i][f].apply(set[i][f], arguments));
                }
                return result;
            };
        }

        var result = [];
        objects.each(function () {
            if (!$.data(this, plugin)) {
                //Initialise
                var instance = new Definition(this, options);
                if (typeof (instance.setup) !== 'undefined' && $.isFunction(instance.setup)) {
                    //If there is a setup function supplied, call it.
                    instance.setup();
                }

                //Store the new functions in a validation data object.
                $.data(this, plugin, instance);
            }

            result.push($.data(this, plugin));
        });

        if (result.length > 1) {
            //We now have a set of plugin instances.
            result = $(result);

            //Take the public functions from the Definition and make them available across the set.
            var template = result[0];
            if (template) {
                for ( var i in template) {
                    if (typeof (template[i]) !== 'undefined' && $.isFunction(template[i])) {
                        result[i] = makeIteratorFunction(i, result);
                    }
                }
            }
        } else {
            result = result[0];
        }

        //Finally mix-in a convenient reference back to the objects, to allow for chaining.
        result.$ = objects;
        return result;
    };

    /**
     * Filmstrip jQuery Plugin
     * @author Marlon Valenzuela
     * fs-index : go to first frame
     * fs-menu : go to frame x:w
     * fs-next : go to next frame
     * fs-prev : go to previous frame
     */

    var jPlug = jPlug || {};
    jPlug.utils = {
        getPixels:function (str) {
            return Number(str.substring(0, str.length-2));
        }
    }
    jPlug.Filmstrip = function (element, options) {
        var _instance = $(element);
        var _element = element;
        var _setup = false;
        var _settings = $.extend({
            onPrev:null,
            onNext:null,
            onReady:null,
            onTweenStart:null,
            onTweenComplete:null,
            onFirstFrame:null,
            onLastFrame:null,
            direction:"horizontal",
            paganation:null,
            next:null,
            prev:null,
            inView:null
        }, options || {});
        var _frame = {
            idx:0,
            loc:[],
            wdth:0,
            hght:0,
            space:0,
        }
        var _events = {
            onReady:function () { if (_settings.onReady) _settings.onReady() },
            onAnimationStart:function () { if (_settings.onTweenStart) _settings.onTweenStart() },
            onAnimationComplete:function () { if (_settings.onTweenComplete) _settings.onTweenComplete(); }
        }

        /*
        * private methods
        * ===============
        * @makeRelative : update main containers' position rule
        * @getFrameInfo : get frames' structure data
        * @addFrameLocation : keep track of each frames' positon
        * @create : using the _frame obj, create filmstrip
        * @animate: animate filmstrip to the current index
        */
        function makeRelative() {
            _instance.css("position", "relative");
        }

        function getFrameInfo() {
            var child = _instance.children()[0];
            var $child = $(child);
            _frame.wdth = jPlug.utils.getPixels($child.css("width"));
            _frame.hght = jPlug.utils.getPixels($child.css("height"));
            if (isH()) _frame.space = jPlug.utils.getPixels($child.css("margin-right"));
                else _frame.spae = jPlug.utils.getPixels($child.css("margin-bottom"));
        }

        function addFrameLocation (loc) {
            _frame.loc.push(loc);
        }

        function create() {
            _instance.children().each(function (index) {
                var $this = $(this);
                $this.css("position", "absolute");
                var obj = {};
                if (isH()) {
                    obj.size = _frame.wdth,
                    obj.direction = "left";
                } else {
                    obj.size = _frame.height;
                    obj.direction = "top";
                }
                var myPosition = (obj.size + _frame.space) * index;
                $this.css(obj.direction, myPosition + "px");
                addFrameLocation(myPosition);
            });
        }

        function bind () {
            //-- activate paganation buttons
            if (_settings.paganation) {
                $(_settings.paganation).each(function (index) {
                    $(this).bind("click", {idx:index}, function (evt) {
                        setIndex(evt.data.idx);
                        animate();
                        return false;
                    });
                });
            }

            //-- activate all 'Home' buttons
            if (_settings.home) {
                $(_settings.home).bind({
                    click:function () {
                        goto(0);
                        return false;
                    }
                });
            }

            //-- activate all "Next' buttons
            if (_settings.next) {
                $(_settings.next).bind({
                    click:function () {
                        goto(getNextIndex());
                        return false;
                    }
                });
            }

            //-- activate all "Previous' buttons
            if (_settings.prev) {
                $(_settings.prev).bind({
                    click:function () {
                        goto(getPreviousIndex());
                        return false;
                    }
                });
            }
        }

        function goto(index) {
            setIndex(index);
            animate();
        }

        function getNextIndex() {
            if (!isLastFrame()) {
                increaseIndex();
            }

            return getIndex();
        }

        function getPreviousIndex() {
            if (!isFirstFrame()) {
                decreaseIndex();
            }

            return getIndex();
        }

        function animate() {
            _events.onAnimationStart();
            var nextPosition = getPosition();
            _instance.animate({left:nextPosition}, "ease", _events.onAnimationComplete);
        }

        /*
        * getter/setters
        * @setIndex: set current frame index 
        * @getIndex: return current frame index
        * @isH : check filmstrips' direction
        */
        function setIndex(index) {
            if (!isNaN(index)) _frame.idx = index;
        }

        function getIndex() {
            return _frame.idx;
        }

        function increaseIndex() {
            _frame.idx++;
        }

        function decreaseIndex() {
            _frame.idx--;
        }

        function getPosition () {
            return -(_frame.loc[getIndex()]);
        }

        function isLastFrame () {
            if (getIndex()==_frame.loc.length-_settings.inView) return true;
                else false;
        }

        function isFirstFrame () {
            if (getIndex()==0) return true;
                else return false;
        }

        function isH() {
            if (_settings.direction=="horizontal") return true;
            return false;
        }

        /*
        * public methods
        * @setup : creates filmstrip
        * @next : animates filmstrip 1 frame forward
        * @prev : animates filmstrip 1 frame backwards
        * @goto : animates filmstrip to a specific frame
        */
        return {
            setup:function () {
                if (_setup) return;
                _setup = !_setup; 

                //-- create and setup filmstrip
                makeRelative();
                getFrameInfo();
                create();
                bind();

                //-- plugin ready
                _events.onReady();
            },

            nextFrame:function ($idx) {
                setIndex($idx);
                animate();
            },

            prevFrame:function ($idx) {
                setIndex($idx);
                animate();
            },

            gotoFrame:function ($idx) {
                setIndex($idx);
                animate();
            }
        }
    };

    $.fn.filmstrip = function (options) {
        return  $.fn.encapsulatedPlugin("filmstrip", jPlug.Filmstrip, $(this), options);
    };
})(jQuery);
