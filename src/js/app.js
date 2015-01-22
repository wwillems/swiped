angular.module('Swiped', [
  'ngRoute',
  'ngTouch',
  'ngResource',
  'ngCookies',
  'mobile-angular-ui',
  'ngDraggable',
  'timer',
  'Swiped.controllers.Main'
])

 .filter('numberFixedLen', function () {
        return function (n, len) {
            var num = parseInt(n, 10);
            len = parseInt(len, 10);
            if (isNaN(num) || isNaN(len)) {
                return n;
            }
            num = '' + num;
            while (num.length < len) {
                num = '0' + num;
            }
            return num;
        };
    })

.factory("ScoreService", function($resource) {
  return $resource("https://score-store-api.herokuapp.com/api/scores");
})

.factory('StoreService',
    ['$http',
    function ($http) {
        var service = {};

        service.storeScore = function (timeInSeconds, date, level, user, callback) {
            console.log('in storeScore');

            score = {'timeInSeconds': timeInSeconds, 'date': date, 'level': level, 'user': user}

            Object.toparams = function ObjecttoParams(obj) {
                var p = [];
                for (var key in obj) {
                    p.push(key + '=' + obj[key]);
                }
                return p.join('&');
            };

            $http({
                method: 'POST',
                url: 'https://score-store-api.herokuapp.com/api/scores',
                data: Object.toparams(score),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            })


        };
 
        return service;
    }])

.factory('AuthenticationService',
    ['Base64', '$http', '$cookieStore', '$rootScope', '$timeout',
    function (Base64, $http, $cookieStore, $rootScope, $timeout) {
        var service = {};

        service.Login = function (username, password, callback) {
                $http.get('https://score-store-api.herokuapp.com/api/users/' + username).
                    success(function(data) {
                        var response = {};
                        if (data != null) {
                            response.success = true;
                        } else {
                            response.success = false;
                            response.message = 'Username or password is incorrect';
                        }
                        callback(response);
                });

        };
 
        service.SetCredentials = function (username, password) {
            var authdata = Base64.encode(username + ':' + password);
 
            $rootScope.globals = {
                currentUser: {
                    username: username,
                    authdata: authdata
                }
            };
 
            $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line
            $cookieStore.put('globals', $rootScope.globals);
        };
 
        service.ClearCredentials = function () {
            $rootScope.globals = {};
            $cookieStore.remove('globals');
            $http.defaults.headers.common.Authorization = 'Basic ';
        };
 
        return service;
    }])
 
.factory('Base64', function () {
    /* jshint ignore:start */
 
    var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
 
    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;
 
            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
 
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
 
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
 
                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);
 
            return output;
        },
 
        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;
 
            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                window.alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
 
            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));
 
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
 
                output = output + String.fromCharCode(chr1);
 
                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
 
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
 
            } while (i < input.length);
 
            return output;
        }
    };
 
    /* jshint ignore:end */
})

.config(function($routeProvider) {
  $routeProvider.
  when('/login', {
    controller: 'LoginController',
    templateUrl: 'login.html',
    hideMenus: true
  }).
  when('/', {templateUrl: 'home.html'}).
  when('/settings', {templateUrl: 'settings.html'}).
  when('/highscores', {templateUrl: 'highscores.html'});
})

.run(['$rootScope', '$location', '$cookieStore', '$http',
  function ($rootScope, $location, $cookieStore, $http) {
    // keep user logged in after page refresh
    $rootScope.globals = $cookieStore.get('globals') || {};
    if ($rootScope.globals.currentUser) {
        $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
    }

    $rootScope.$on('$routeChangeStart', function (event, next, current) {
        // redirect to login page if not logged in
        if ($location.path() !== '/login' && !$rootScope.globals.currentUser) {
            $location.path('/login');
        }
    });
}]);

/*
 *
 * https://github.com/fatlinesofcode/ngDraggable
 */
angular.module("ngDraggable", [])
        .directive('ngDrag', ['$rootScope', '$parse', function ($rootScope, $parse) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    scope.value = attrs.ngDrag;
                 //   console.log("ngDraggable", "link", "", scope.value);
                  //  return;
                    var offset,_mx,_my,_tx,_ty;
                    var _hasTouch = ('ontouchstart' in document.documentElement);
                    var _pressEvents = 'touchstart mousedown';
                    var _moveEvents = 'touchmove mousemove';
                    var _releaseEvents = 'touchend mouseup';

                    var $document = $(document);
                    var $window = $(window);
                    var _data = null;

                    var _dragEnabled = false;

                    var _pressTimer=null;

                    var onDragSuccessCallback = $parse(attrs.ngDragSuccess) || null;

                    var initialize = function () {
                        element.attr('draggable', 'false'); // prevent native drag
                        toggleListeners(true);
                    };


                    var toggleListeners = function (enable) {
                        // remove listeners

                        if (!enable)return;
                        // add listeners.

                        scope.$on('$destroy', onDestroy);
                        attrs.$observe("ngDrag", onEnableChange);
                        scope.$watch(attrs.ngDragData, onDragDataChange);
                        element.on(_pressEvents, onpress);
                        if(! _hasTouch){
                            element.on('mousedown', function(){ return false;}); // prevent native drag
                        }
                    };
                    var onDestroy = function (enable) {
                        toggleListeners(false);
                    };
                    var onDragDataChange = function (newVal, oldVal) {
                        _data = newVal;
                     //   console.log("69","onDragDataChange","data", _data);
                    }
                    var onEnableChange = function (newVal, oldVal) {
                        _dragEnabled=scope.$eval(newVal);

                    }
                    /*
                     * When the element is clicked start the drag behaviour
                     * On touch devices as a small delay so as not to prevent native window scrolling
                     */
                    var onpress = function(evt) {
                        if(! _dragEnabled)return;


                        if(_hasTouch){
                            cancelPress();
                            _pressTimer = setTimeout(function(){
                                cancelPress();
                                onlongpress(evt);
                            },100);
                            $document.on(_moveEvents, cancelPress);
                            $document.on(_releaseEvents, cancelPress);
                        }else{
                            onlongpress(evt);
                        }

                    }
                    var cancelPress = function() {
                        clearTimeout(_pressTimer);
                        $document.off(_moveEvents, cancelPress);
                        $document.off(_releaseEvents, cancelPress);
                    }
                    var onlongpress = function(evt) {
                        if(! _dragEnabled)return;
                        evt.preventDefault();
                        offset = element.offset();
                        element.centerX = (element.width()/2);
                        element.centerY = (element.height()/2);
                        element.addClass('dragging');
                        _mx = (evt.pageX || evt.originalEvent.touches[0].pageX);
                        _my = (evt.pageY || evt.originalEvent.touches[0].pageY);
                        _tx=_mx-element.centerX-$window.scrollLeft()
                        _ty=_my -element.centerY-$window.scrollTop();
                        moveElement(_tx, _ty);
                        $document.on(_moveEvents, onmove);
                        $document.on(_releaseEvents, onrelease);
                        $rootScope.$broadcast('draggable:start', {x:_mx, y:_my, tx:_tx, ty:_ty, element:element, data:_data});

                    }
                    var onmove = function(evt) {
                        if(! _dragEnabled)return;
                        evt.preventDefault();

                        _mx = (evt.pageX || evt.originalEvent.touches[0].pageX);
                        _my = (evt.pageY || evt.originalEvent.touches[0].pageY);
                        _tx=_mx-element.centerX-$window.scrollLeft()
                        _ty=_my -element.centerY-$window.scrollTop();
                        moveElement(_tx, _ty);

                        $rootScope.$broadcast('draggable:move', {x:_mx, y:_my, tx:_tx, ty:_ty, element:element, data:_data});

                    }
                    var onrelease = function(evt) {
                        if(! _dragEnabled)return;
                        evt.preventDefault();
                        $rootScope.$broadcast('draggable:end', {x:_mx, y:_my, tx:_tx, ty:_ty, element:element, data:_data, callback:onDragComplete});
                        element.removeClass('dragging');
                        reset();
                        $document.off(_moveEvents, onmove);
                        $document.off(_releaseEvents, onrelease);

                    }
                    var onDragComplete = function(evt) {

                        if(! onDragSuccessCallback)return;

                        scope.$apply(function () {
                            onDragSuccessCallback(scope, {$data: _data, $event: evt});
                        });
                    }
                    var reset = function() {
                        element.css({left:'',top:'', position:'', 'z-index':''});
                    }
                    var moveElement = function(x,y) {
                        element.css({left:x,top:y, position:'fixed', 'z-index':99999});
                    }
                    initialize();
                }
            }
        }])
        .directive('ngDrop', ['$parse', '$timeout', function ($parse, $timeout) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    scope.value = attrs.ngDrop;

                    var _dropEnabled=false;

                    var onDropCallback = $parse(attrs.ngDropSuccess);// || function(){};
                    var initialize = function () {
                        toggleListeners(true);
                    };


                    var toggleListeners = function (enable) {
                        // remove listeners

                        if (!enable)return;
                        // add listeners.
                        attrs.$observe("ngDrop", onEnableChange);
                        scope.$on('$destroy', onDestroy);
                        //scope.$watch(attrs.uiDraggable, onDraggableChange);
                        scope.$on('draggable:start', onDragStart);
                        scope.$on('draggable:move', onDragMove);
                        scope.$on('draggable:end', onDragEnd);
                    };
                    var onDestroy = function (enable) {
                        toggleListeners(false);
                    };
                    var onEnableChange = function (newVal, oldVal) {
                        _dropEnabled=scope.$eval(newVal);
                    }
                    var onDragStart = function(evt, obj) {
                        if(! _dropEnabled)return;
                        isTouching(obj.x,obj.y,obj.element);
                    }
                    var onDragMove = function(evt, obj) {
                        if(! _dropEnabled)return;
                        isTouching(obj.x,obj.y,obj.element);
                    }
                    var onDragEnd = function(evt, obj) {
                        if(! _dropEnabled)return;
                        if(isTouching(obj.x,obj.y,obj.element)){
                            // call the ngDraggable element callback
                           if(obj.callback){
                                obj.callback(evt);
                            }

                            // call the ngDrop element callback
                         //   scope.$apply(function () {
                         //       onDropCallback(scope, {$data: obj.data, $event: evt});
                         //   });
                            $timeout(function(){
                                onDropCallback(scope, {$data: obj.data, $event: evt});
                            });


                        }
                        updateDragStyles(false, obj.element);
                    }
                    var isTouching = function(mouseX, mouseY, dragElement) {
                        var touching= hitTest(mouseX, mouseY);
                        updateDragStyles(touching, dragElement);
                        return touching;
                    }
                    var updateDragStyles = function(touching, dragElement) {
                        if(touching){
                            element.addClass('drag-enter');
                            dragElement.addClass('drag-over');
                        }else{
                            element.removeClass('drag-enter');
                            dragElement.removeClass('drag-over');
                        }
                    }
                    var hitTest = function(x, y) {
                        var bounds = element.offset();
                        bounds.right = bounds.left + element.outerWidth();
                        bounds.bottom = bounds.top + element.outerHeight();
                        return x >= bounds.left
                                && x <= bounds.right
                                && y <= bounds.bottom
                                && y >= bounds.top;
                    }

                    initialize();
                }
            }
        }])
        .directive('ngDragClone', ['$parse', '$timeout', function ($parse, $timeout) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var img;
                    scope.clonedData = {};
                    var initialize = function () {

                        img = $(element.find('img'));
                        element.attr('draggable', 'false');
                        img.attr('draggable', 'false');
                        log("243","initialize","img", img);
                        reset();
                        toggleListeners(true);
                    };


                    var toggleListeners = function (enable) {
                        // remove listeners

                        if (!enable)return;
                        // add listeners.
                        scope.$on('draggable:start', onDragStart);
                        scope.$on('draggable:move', onDragMove);
                        scope.$on('draggable:end', onDragEnd);
                        preventContextMenu();

                    };
                    var preventContextMenu = function() {
                      //  element.off('mousedown touchstart touchmove touchend touchcancel', absorbEvent_);
                        img.off('mousedown touchstart touchmove touchend touchcancel', absorbEvent_);
                      //  element.on('mousedown touchstart touchmove touchend touchcancel', absorbEvent_);
                        img.on('mousedown touchstart touchmove touchend touchcancel', absorbEvent_);
                    }
                    var onDragStart = function(evt, obj) {
                        scope.$apply(function(){
                            scope.clonedData = obj.data;
                         //   preventContextMenu();
                        });
                        log("259","onDragStart","onDragStart", obj.element.width());
                        element.width(obj.element.width())
                        element.height(obj.element.height())
                        moveElement(obj.tx,obj.ty);
                    }
                    var onDragMove = function(evt, obj) {
                        moveElement(obj.tx,obj.ty);
                    }
                    var onDragEnd = function(evt, obj) {
                        //moveElement(obj.tx,obj.ty);
                        reset();
                    }

                    var reset = function() {
                        element.css({left:0,top:0, position:'fixed', 'z-index':-1, visibility:'hidden'});
                    }
                    var moveElement = function(x,y) {
                        element.css({left:x,top:y, position:'fixed', 'z-index':99999, visibility:'visible'});
                    }

                    var absorbEvent_ = function (event) {
                        var e = event.originalEvent;
                        e.preventDefault && e.preventDefault();
                        e.stopPropagation && e.stopPropagation();
                        e.cancelBubble = true;
                        e.returnValue = false;
                        return false;
                    }

                    initialize();
                }
            }
        }])
        .directive('ngPreventDrag', ['$parse', '$timeout', function ($parse, $timeout) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var initialize = function () {

                        element.attr('draggable', 'false');
                        toggleListeners(true);
                    };


                    var toggleListeners = function (enable) {
                        // remove listeners

                        if (!enable)return;
                        // add listeners.
                        element.on('mousedown touchstart touchmove touchend touchcancel', absorbEvent_);
                    };


                    var absorbEvent_ = function (event) {
                        var e = event.originalEvent;
                        e.preventDefault && e.preventDefault();
                        e.stopPropagation && e.stopPropagation();
                        e.cancelBubble = true;
                        e.returnValue = false;
                        return false;
                    }

                    initialize();
                }
            }
        }]);  