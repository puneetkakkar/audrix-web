var app = angular.module('Audrix', ['ngRoute', 'ngMaterial', 'ngAnimate', 'ngMessages',
  'LocalStorageModule', 'satellizer', 'ngFileUpload', 'cfp.hotkeys', 'ngImageAppear'
]);

app.run(function($window, $rootScope, $auth, $timeout) {
  $rootScope.online = navigator.onLine;
  $rootScope.bootstrapFlag = true;
  $timeout(function() {
    $rootScope.bootstrapFlag = false;
  }, 1500);
  $window.addEventListener('offline', function() {
    $rootScope.$apply(function() {
      $rootScope.online = false;
      document.body.style.overflowX = "hidden";
      document.body.style.overflowY = "hidden";
    });
  }, false);
  $window.addEventListener('online', function() {
    $rootScope.$apply(function() {
      $rootScope.online = true;
      $rootScope.bootstrapFlag = true;
      document.body.style.overflowY = 'hidden';

      $timeout(function() {
        $rootScope.bootstrapFlag = false;
      }, 5000);
    });
  }, false);

  $rootScope.$on('$routeChangeSuccess', function(event, current, previous) {
    $rootScope.title = current.$$route.title;
  });

  // if ($auth.isAuthenticated()) {
  //      $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
  //    }

});

app.config(function($routeProvider, $locationProvider, $mdThemingProvider,
  localStorageServiceProvider, $authProvider) {
  localStorageServiceProvider.setPrefix('aud');
  $mdThemingProvider.theme('audBasic')
    .primaryPalette('deep-purple', {
      'default': '500',
      'hue-1': '400',
      'hue-2': '300',
      'hue-3': '200'
    })
    .accentPalette('pink', {
      'default': 'A400',
      'hue-1': 'A200',
      'hue-2': 'A100',
      'hue-3': 'A100'
    })
    .warnPalette('red', {
      'default': '800',
      'hue-1': '400',
      'hue-2': '500',
      'hue-3': 'A100'
    });
  $mdThemingProvider.setDefaultTheme('audBasic');

  $authProvider.facebook({
    clientId: '1919373968379030',
    url: 'http://localhost:1337/v1/auth/facebook'
  });

  $authProvider.google({
    clientId: '128216312736-e0e2bd08oj2bho1qgb5fgd3mgr5dmnbf.apps.googleusercontent.com',
    url: 'http://localhost:1337/v1/auth/google'
  });

  $routeProvider
    .when('/', {
      controller: 'AudrixAppController',
      templateUrl: 'app/components/homepage.html',
      title: 'Home Page'
    })
    .when('/auth/signup', {
      controller: 'LoginController',
      templateUrl: 'app/components/auth/signup.html',
      title: 'Secure Signup Page'
    })
    .when('/auth/login', {
      controller: 'LoginController',
      templateUrl: 'app/components/auth/login.html',
      title: 'Secure Login Page'
    })
    .when('/auth/credentials', {
      controller: 'LoginController',
      templateUrl: 'app/components/auth/credentials.html',
      title: 'Credentials'
    })
    .when('/admin/upload', {
      controller: 'UploadFileController',
      templateUrl: 'app/components/upload/upload.html',
      title: 'Upload'
    })
    .when('/browse', {
      controller: 'WebPlayerController',
      templateUrl: 'app/components/landingPage.html',
      title: 'Browse'
    })
    .when('/profile/:username', {
      controller: 'UserController',
      templateUrl: 'app/components/user/profile.html',
      title: 'Profile'
    })
    .when('/search', {
      controller: 'SearchController',
      templateUrl: 'app/components/search/search.html',
      title: 'Search'
    })
    .when('/auzone', {
      controller: 'RecommendationController',
      templateUrl: 'app/components/recommendation/recommendation.html',
      title: 'Auzone'
    })
    .when('/settings', {
      controller: 'UserController',
      templateUrl: 'app/components/user/settings.html',
      title: 'Settings'
    })
    .when('/explore', {
      controller: 'ExploreController',
      templateUrl: 'app/components/explore/explore.html',
      title: 'Explore'
    })

    .otherwise({
      redirectTo: '/'
    });
  $locationProvider.html5Mode(true);
});
