/**
 * jDropdown v1.0.0
 * require jquery 1.7+ , bootstrap 3.0.3+
 * MIT License
 * for more info pls visit :https://github.com/ElvinChan/jDropdown
 */
;
(function ($, window, document, undefined) {
    // Create the defaults once
    var pluginName = 'jDropdown',
        defaults = {
            isSplit: true, // Whether the title of drop-down display in a single element on the left of the drop-down button
            titleStyle: 'span', // Witch will be use for title label, span or button
            width: 'auto', // The width of the title label. e.g. 200px, 50%
            isUp: false, // Popup the menu by specify this attribute 'true'
            defaultValue: null, // Default key of drop-down menu, which will be displayed on the title label
            separator: undefined, // Specify position of the separators by int array
            menuAlign: 'left', // Specify alignment of drop-down menu 'left' or 'right', the attribute 'width' should be 'auto'
            disabledKeys: undefined, // Specify disabled items of drop-down menu according to key
            func: undefined // The function will be called when item of the drop-down menu is clicked, whose key will be passed to the function
        };

    // 1.Basic Method
    // 从控件获取设置项
    var getSettings = function (obj, isInit) {
        var settings = obj.data(pluginName);
        if (!isInit && typeof(settings) == 'undefined') {
            window.console.error('Could not get data from drop-down control, please exec "init" method first');
        }
        return settings;
    }

    // 2.Private Method
    var isArrayType = function(value) {
        if (typeof Array.isArray === 'function') {
            return Array.isArray(value);
        } else {
            return Object.prototype.toString.call(value) === '[object Array]';
        }
    }

    // combine options to control
    var combineOptions = function (obj, options) {
        var settings = obj.data(pluginName);

        // validation
        if (options.titleStyle != 'span' && options.titleStyle != 'button') {
            options.titleStyle = undefined;
        }

        settings = $.extend({}, settings, options);
        obj.data(pluginName, settings);
        // combine setting
        return settings;
    }

    // get current title label
    var getCurrentLabel = function (obj) {
        if (obj.prev().length > 0) {
            return obj.prev();
        } else {
            return obj;
        }
    }

    // put first selection into title label
    var setFirstSelection = function (obj, value) {
        var label = obj;
        if (obj.prev().length > 0) {
            label = obj.prev();
        }
        if (value == null) {
            // no default selection
            label.text(obj.next('ul').find('a:first').text());
            if (obj.next('ul').find('a:first').attr('data-dropdown') != undefined) {
                label.attr('title', obj.next('ul').find('a:first').text());
            } else {
                label.removeAttr('title');
            }
            obj.attr('data-dropdown', obj.next('ul').children('li:first').attr('data-dropdown'));
        } else {
            // has default selection
            label.text(value).removeAttr('title');
            obj.removeAttr('data-dropdown');
        }
    }

    // 3.Settings Method
    var setWidth = function (obj, value) {
        var label = getCurrentLabel(obj);
        label.width(value);
        obj.next('.dropdown-menu').width(obj.parent('.btn-group').width());
    }

    var setIsUp = function (obj, value) {
        if (value) {
            obj.parent().addClass('dropup');
        } else {
            obj.parent().removeClass('dropup');
        }
    }

    var setDefaultValue = function (obj, value) {
        var defaultAttr = obj.next('ul').children('li:first').attr('data-dropdown');
        if (defaultAttr == undefined && value != null) {
            // no default options, now add
            obj.next('ul').prepend('<li><a>' + value + '</a></li>');
        } else if (defaultAttr != undefined && value == null) {
            // has default options, now remove
            obj.next('ul').children('li:first').remove();
        }
        setFirstSelection(obj, value);
    }

    var setIsSplit = function (obj, value) {
        if (value) {
            obj.text(obj.prev().text());
            obj.prev().remove();
        } else {
            obj.parent().prepend('<span class="btn">' + obj.text() + '</span>');
            obj.text('');
        }
    }

    var setTitleStyle = function (obj, value) {
        if (obj.prev().length == 0)
            return;
        var labelHtml = obj.prev().prop('outerHTML');
        if (value == 'span') {
            var re = new RegExp('^<button .*<\/button>$', 'i');
            if (re.test(labelHtml)) {
                labelHtml.replace(/^<button /i, '<span ');
                labelHtml.replace(/<\/button>$/i, '</span>');
            }
        } else if (value == 'button') {
            var re = new RegExp('^<span .*<\/span>$', 'i');
            if (re.test(labelHtml)) {
                labelHtml = labelHtml.replace(/^<span /i, '<button ');
                labelHtml = labelHtml.replace(/<\/span>$/i, '</button>');
            }
        }
        obj.prev().replaceWith(labelHtml);
    }

    var setSeparator = function (obj, value) {
        obj.next('ul').children('.divider').remove();
        if (!isArrayType(value))
            return;
        for (var i = 0; i < value.length; i++) {
            if (value[i] > 0) {
                obj.next('ul').children('[data-dropdown]').eq(value[i] - 1).after('<li role="separator" class="divider"></li>');
            }
        }
    }

    var setMenuAlign = function (obj, value) {
        if (value) {
            obj.next('ul').addClass("dropdown-menu-right");
        } else {
            obj.next('ul').removeClass("dropdown-menu-right");
        }
    }

    var setDisabledKeys = function (obj, value) {
        obj.next('ul').children().removeClass('disabled');
        if (!isArrayType(value))
            return;
        for (var i = 0; i < value.length; i++) {
            obj.next('ul').children('li[data-dropdown=' + value[i] + ']').addClass("disabled");
        }
    }

    var setFunc = function (obj, value) {
        obj.next('ul').find('a').unbind();

        obj.next('ul').find('a').on('click', function () {
            var label = getCurrentLabel($(this).parent().parent().prev());
            if ($(this).parent().attr('data-dropdown') == undefined) {
                $(this).parent().parent().prev('button').removeAttr('data-dropdown');
                label.removeAttr('title');
            } else {
                $(this).parent().parent().prev('button').attr('data-dropdown', $(this).attr('data-dropdown'));
                label.attr('title', $(this).text());
            }
            label.text($(this).text());

            if (value != undefined) {
                value($(this).parent().attr('data-dropdown'));
            }
        });
    }

    // handle settings
    var execOptions = function (obj, settings, options) {
        if (options.isSplit && settings.isSplit != options.isSplit) {
            setIsSplit(obj, options.isSplit);
            if (settings.width) {
                setWidth(obj, settings.width);
            }
            if (settings.titleStyle) {
                setTitleStyle(obj, settings.titleStyle);
            }
        }
        if (options.titleStyle && settings.titleStyle != options.titleStyle) {
            setTitleStyle(obj, options.titleStyle);
        }
        if (options.width && settings.width != options.width) {
            setWidth(obj, options.width);
        }
        if (options.isUp && settings.isUp != options.isUp) {
            setIsUp(obj, options.isUp);
        }
        if (options.defaultValue && settings.defaultValue != options.defaultValue) {
            setDefaultValue(obj, options.defaultValue);
        }
        if (options.separator && settings.separator != options.separator) {
            setSeparator(obj, options.separator);
        }
        if (options.menuAlign && settings.menuAlign != options.menuAlign) {
            setMenuAlign(obj, options.menuAlign);
        }
        if (options.disabledKeys && settings.disabledKeys != options.disabledKeys) {
            setDisabledKeys(obj, options.disabledKeys);
        }
        if (options.func && settings.func != options.func) {
            setFunc(obj, options.func);
        }
    }

    // 4.Public Method
    var methods = {
        init: function (options) {
            return this.each(function () {
                var $this = $(this);

                // try to get settings
                var settings = getSettings($this, true);

                if (typeof (settings) == 'undefined') {
                    settings = $.extend({}, defaults, options);
                    // save settings
                    $this.data(pluginName, settings);

                    // basic skeletons
                    $this.wrap('<div class="btn-group"></div>')
                         .addClass('btn btn-default dropdown-toggle').attr({
                             'data-toggle': 'dropdown',
                             'aria-haspopup': 'true',
                             'aria-expanded': 'false',
                             'disabled': 'disabled'
                         })
                         .append('<span class="caret"></span><span class="sr-only">Toggle Dropdown</span>')
                         .after('<ul class="dropdown-menu"></ul>');

                    if (settings.isSplit) {
                        $this.before('<span class="btn"></span>');
                    }

                    setWidth($this, settings.width);
                    setIsUp($this, settings.isUp);
                    setDefaultValue($this, settings.defaultValue);

                } else {
                    execOptions($this, settings, options);

                    settings = $.extend({}, settings, options);
                    // save settings
                    $this.data(pluginName, settings);

                    setFirstSelection($this, settings.defaultValue);
                }
            });
        },
        loadData: function (list, options) {
            return this.each(function () {
                var $this = $(this);

                // 1.set basic attributes
                var settings = getSettings($this);

                if (options) {
                    execOptions($this, settings, options);

                    // 2.combine settings
                    settings = combineOptions($this, options);
                }

                // 3.clear old selections, load new selections
                $this.next('ul').children('li').remove();

                var ul = $this.removeAttr('disabled').removeAttr('data-dropdown').next('ul');
                for (var i = 0; i < list.length; i++) {
                    ul.append('<li data-dropdown="' + list[i][settings.key] + '"><a title="' + list[i][settings.value] + '">' + list[i][settings.value] + '</a></li>');
                }

                setFirstSelection($this, settings.defaultValue);
                setSeparator($this, settings.separator);

                var label = getCurrentLabel($this);
                // 4.load events
                ul.find('a').on('click', function () {
                    var label = getCurrentLabel($(this).parent().parent().prev());
                    if ($(this).parent().attr('data-dropdown') == undefined) {
                        $(this).parent().parent().prev('button').removeAttr('data-dropdown');
                        label.removeAttr('title');
                    } else {
                        $(this).parent().parent().prev('button').attr('data-dropdown', $(this).attr('data-dropdown'));
                        label.attr('title', $(this).text());
                    }
                    label.text($(this).text());
                    
                    if (settings.func != undefined) {
                        settings.func($(this).parent().attr('data-dropdown'));
                    }
                });
            });
        },
        update: function (options) {
            return this.each(function () {
                var $this = $(this);
                var settings = getSettings($this);
                execOptions($this, settings, options);
                combineOptions($this, options);
            });
        },
        insertItem: function (list, options) {
            return this.each(function () {
                var $this = $(this);

                // 1.set basic attributes
                var settings = getSettings($this);

                if (options) {
                    execOptions($this, settings, options);

                    // 2.combine settings
                    settings = combineOptions($this, options);
                }

                // 3.clear old selections, load new selections
                // $this.next('ul').children('li').remove();

                // var ul = $this.removeAttr('data-dropdown').next('ul');
                var ul = $this.next('ul');
                var lastIndex = ul.find('a').length - 1;
                for (var i = 0; i < list.length; i++) {
                    ul.append('<li data-dropdown="' + list[i][settings.key] + '"><a title="' + list[i][settings.value] + '">' + list[i][settings.value] + '</a></li>');
                }

                // setFirstSelection($this, settings.defaultValue);
                setSeparator($this, settings.separator);

                var label = getCurrentLabel($this);
                // 4.load events
                ul.find('a:gt('+ lastIndex +')').on('click', function () {
                    var label = getCurrentLabel($(this).parent().parent().prev());
                    if ($(this).parent().attr('data-dropdown') == undefined) {
                        $(this).parent().parent().prev('button').removeAttr('data-dropdown');
                        label.removeAttr('title');
                    } else {
                        $(this).parent().parent().prev('button').attr('data-dropdown', $(this).attr('data-dropdown'));
                        label.attr('title', $(this).text());
                    }
                    label.text($(this).text());

                    if (settings.func != undefined) {
                        settings.func($(this).parent().attr('data-dropdown'));
                    }
                });
            });
        },
        removeItem: function (list, options) {
            return this.each(function () {
                if (!isArrayType(list))
                    return;
                for (var i = 0; i < list.length; i++) {
                    var target = $(this).next('ul').children('[data-dropdown=' + list[i] + ']');
                    if ((target.next().length == 0 && target.prev('.divider').length > 0) || (target.next('.divider').length > 0 && target.prev('.divider').length > 0)) {
                        target.prev('.divider').remove();
                        target.remove();
                    }
                }
            });
        },
        clickItem: function (key) {
            return this.each(function () {
                $(this).next('ul').find('a[data-dropdown='+ key +']').click();
            });
        },
        destroy: function () {
            return this.each(function () {
                var $this = $(this);

                $(window).unbind(pluginName);
                $this.removeData(pluginName);
            })
        }
    };

    $.fn.jDropdown = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + 'does not exist on jQuery.jDropdown');
        }
    };
})(jQuery, window, document);