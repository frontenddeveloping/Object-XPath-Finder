(function (global, undefined) {

    'use strict';

    var SEPARATOR_CHAR = '/',
        EMPTY_STRING = '',
        ANY_CHAR = '*',
        ObjectFinder;

    function isObject (obj) {
        return  obj && !obj.nodeType && !obj.setInterval && Object(obj) === obj;
    }

    function extend () {
        var i = 0,
            args = [].slice.call(arguments),
            target = args[i],
            src = args[++i],
            prop;

        while (src) {
            for (prop in src) {
                if (src.hasOwnProperty(prop)) {
                    if (isObject(src[prop])) {
                        target[prop] = extend({}, src[prop]);
                    } else {
                        target[prop] = src[prop];
                    }
                }
            }
            src = args[++i];
        }

        return target;
    }

    ObjectFinder = {
        object : undefined,
        result : undefined,
        parent : undefined,
        stack : [],
        current : 0,
        reset : function () {
            var self = this;
            self.object = undefined;
            self.result = undefined;
            self.parent = undefined;
            self.stack = [];
            self.current = 0;
        },
        find : function(key, from) {
            var self = this,
                target = from || self.object,
                length,
                context;

            if (isObject(target)) {
                Object.keys(target).forEach(function (any) {
                    if (any === key) {
                        self.result = self.result || [];
                        self.result.push(target[any])
                    } else if (isObject(target[any]) && self.stack.indexOf(target[any]) < 0) {
                        self.stack.push(target[any]);
                    }
                });
            }

            length = self.stack.length;

            while(self.current < length) {
                context = self.stack[self.current];
                self.current++;
                self.find(key, context);
                self.stack.splice(self.current-1, 1);
            }

            return self.result;

        }
    };

    function find (parsedPathObject, contextsArray) {
        var pathValue = parsedPathObject.path,
            newContexts = [];

        contextsArray.forEach(function (context) {
            var tmpContexts;

            // Primitive type, nothing to search
            if (!isObject(context)) {
                return;
            }

            if (parsedPathObject.deep) {
                ObjectFinder.find(pathValue, context);
                tmpContexts = ObjectFinder.result && ObjectFinder.result.slice();
            } else {
                tmpContexts = [context[pathValue]];
            }

            if (!tmpContexts) {
                return;
            }

            newContexts = newContexts.concat(tmpContexts);

        });

        return newContexts;
    }

    function findAll (parsedPathObject, contextsArray) {
        var tmpContexts = [],
            result = [];

        contextsArray.forEach(function (context) {

            // Primitive type, nothing to search
            if (isObject(context)) {
                Object.keys(context).forEach(function (key) {
                    var value = context[key];
                    if (isObject(value)) {
                        tmpContexts.push(value);
                    }
                    result.push(value);
                });
            } else {
                result.push(context);
            }

        });

        if (tmpContexts[0] && parsedPathObject.deep) {
            result = result.concat(findAll(parsedPathObject, tmpContexts));
        }

        return result;

    }

    function parsePath (userPath) {
        var fullPath = userPath || EMPTY_STRING,
            pathArray = fullPath.replace(/\/{2,}/g, '//').split(SEPARATOR_CHAR),
            pathIndex = 0,
            isDeepSearch = false,
            currentPath = pathArray[0],
            parsedPathArray = [],
            isFirst;

        // First EMPTY_STRING char does not need any more
        if (currentPath === EMPTY_STRING) {
            pathIndex++;
            currentPath = pathArray[pathIndex];
        }

        while (currentPath !== undefined) {

            isFirst = currentPath && pathIndex === 0;

            if (currentPath === EMPTY_STRING || isFirst) {

                isDeepSearch = true;

                if (!isFirst) {
                    // Move to next path, because currentPath is SEPARATOR_CHAR
                    // This next path will park as deep search
                    pathIndex++;
                    currentPath = pathArray[pathIndex];
                }

            } else {
                isDeepSearch = false;
            }

            parsedPathArray.push({
                deep : isDeepSearch,
                path : currentPath || ANY_CHAR
            });

            // Init new currentPath for loop check
            pathIndex++;
            currentPath = pathArray[pathIndex];

        }

        return parsedPathArray;

    }

    function ObjectXPathFinder (userObject, userPath) {
        var targetObject = extend({}, userObject),
            result = [],
            parsedPathArray = parsePath(userPath);

        if (parsedPathArray[0]) {

            result = [targetObject];

            parsedPathArray.forEach(function (parsedPathObject) {

                if (parsedPathObject.path === ANY_CHAR) {
                    result = findAll(parsedPathObject, result);
                } else {
                    ObjectFinder.reset();
                    result = find(parsedPathObject, result);
                }

            });

        }

        return result;

    }

    if ( typeof global.define === 'function' && global.define.amd ) {
        global.define('ObjectXPathFinder', [], function() {
            return ObjectXPathFinder;
        });
    } else {
        global.ObjectXPathFinder = ObjectXPathFinder;
    }

}(window));
