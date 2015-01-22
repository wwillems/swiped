angular.module('Swiped.controllers.Main', [])

.factory('sharedService', function($rootScope) {
	var sharedService = {};

	sharedService.level = "{\"name\":\"3 x 3 tiles\",\"rowWidth\":3}";

	sharedService.setLevel = function(level) {
		this.level = level;
	};

	return sharedService;
})

.controller('MainCtrl', function ($scope, StoreService, $cookieStore, sharedService) {

    $scope.draggableObjects = [];

    if (sharedService.level.rowWidth == undefined) {
		$scope.levels = 3;
    } else {
    	$scope.levels = sharedService.level.rowWidth;
	}

 	var elements = ($scope.levels * $scope.levels) - 1;
    for (var i = 1; i <= elements; i++) {
		$scope.draggableObjects.push({name: i});
    }

    $scope.draggableObjects.push({name: 'L'});

    shuffle($scope.draggableObjects, $scope.levels);

    $scope.onDropComplete = function (index, obj, evt) {
        var otherObj = $scope.draggableObjects[index];
        var otherIndex = $scope.draggableObjects.indexOf(obj);

        if ($scope.stopped) {
            $scope.resumeTimer('clock-timer');
            $scope.stopped = false;
        }

        console.log('in onDropComplete - obj: ' + obj.name + " (" + otherIndex + ")" + ', otherObj: ' + otherObj.name + " (" + index + ")");

        if (otherObj.name == 'L') {
            if ((index + 1 == otherIndex) || (index - 1 == otherIndex) || 
                (index + $scope.levels == otherIndex) || (index - $scope.levels == otherIndex)) {
                $scope.draggableObjects[index] = obj;
                $scope.draggableObjects[otherIndex] = otherObj;
            }
        }

        // check if finished
        if (isFinished($scope.draggableObjects)) {
            $scope.stopTimer('clock-timer');
            document.getElementById("stop").disabled = true;
            document.getElementById("resume").disabled = true;
            document.getElementById("upload").disabled = false;
        }

    };

    $scope.linkAnchors = function () {
        $('ul.nav a').click(function (){
            var path = $(this).attr('href');
            if (path != '#') {
                window.location = path;
            }
        });
    };
    
    $scope.callbackTimer={};
    $scope.callbackTimer.status='Running';
    $scope.callbackTimer.callbackCount=0;    
    $scope.callbackTimer.finished=function() {
        console.log('callbackTimer finished');
        $scope.callbackTimer.status='COMPLETE!!';
        $scope.callbackTimer.callbackCount++;
        $scope.$apply();
    };

    $scope.resumeTimer = function (sectionId) {
        console.log('resumeTimer called');
        document.getElementById(sectionId).getElementsByTagName('timer')[0].resume();
        document.getElementById("resume").disabled = true;
        document.getElementById("stop").disabled = false;
        $scope.stopped=false;
    };

    $scope.stopTimer = function (sectionId) {
        console.log('stopTimer called');
        $scope.$broadcast('timer-stop');

        document.getElementById(sectionId).getElementsByTagName('timer')[0].stop();
        document.getElementById("stop").disabled = true;
        document.getElementById("resume").disabled = false;
        $scope.stopped=true;
    };

    $scope.uploadScore = function () {
        console.log('uploadScore called');
        document.getElementById("upload").disabled = true;

        console.log('>>> username: ' + $cookieStore.get('globals').currentUser.username);
        StoreService.storeScore($scope.minutes * 60 + $scope.seconds, new Date, $scope.levels, $cookieStore.get('globals').currentUser.username, function(response) {
            if(response.success) {
            	console.log('callback success');
            } else {
				console.log('callback: ' + response.message + ' - ' + response.data);
            }
        });
    };

    $scope.$on('timer-stopped', function (event, data) {
        $scope.minutes = data.minutes;
        $scope.seconds = data.seconds;
    });

    /**
     * Randomize array element order in-place.
     * Using Fisher-Yates shuffle algorithm.
     */
    function shuffle(array, rowWidth) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    function isFinished(array) {
        for (var i = 0; i < array.length - 2; i++) { // exclude "L", therefore length-2
            if (array[i].name != i+1) {
                return false;
            }
        }
        return true;
    }

})


.controller('LoginController',
['$scope', '$rootScope', '$location', 'AuthenticationService',
function ($scope, $rootScope, $location, AuthenticationService) {
    // reset login status
    AuthenticationService.ClearCredentials();

    $scope.login = function () {
        $scope.dataLoading = true;
        AuthenticationService.Login($scope.username, $scope.password, function(response) {
            if(response.success) {
                AuthenticationService.SetCredentials($scope.username, $scope.password);
                $location.path('/');
            } else {
                $scope.error = response.message;
                $scope.dataLoading = false;
            }
        });
    };
}])

.controller("ScoreController", function($scope, ScoreService) {
  ScoreService.query(function(data) {
    $scope.highscores = data;
  });
})

.controller('SettingsController', function($scope, sharedService) {
	$scope.levels = [
	  {name:'3 x 3 tiles', rowWidth:3},
	  {name:'4 x 4 tiles', rowWidth:4},
	  {name:'5 x 5 tiles', rowWidth:5},
	  {name:'6 x 6 tiles', rowWidth:6}
	];

	$scope.myLevel = sharedService.level;

	$scope.handleChange = function(level) {
		sharedService.setLevel(level);
	};
	
})

.controller('MainController', function($scope, sharedService) {
	if (sharedService.level.rowWidth == undefined) {
		$scope.rowWidth = 3;
	} else {
		$scope.rowWidth = sharedService.level.rowWidth;
	}
});

/**
 * Randomize array element order in-place.
 * Using Fisher-Yates shuffle algorithm.
 */
function shuffle(array, rowWidth) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}
