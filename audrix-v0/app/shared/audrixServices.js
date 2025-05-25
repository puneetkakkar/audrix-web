(function(angular) {
  'use strict';
  angular.module('Audrix')

    .service('UserLoginService', ['$rootScope', '$http', 'ConfigService', 'localStorageService', '$routeParams', '$window', '$location',
      function($rootScope, $http, ConfigService, localStorageService, $routeParams, $window, $location) {
        var self = this;
        var token = localStorageService.get('token');
        self.uri = ConfigService.getOrigApiUrl();

        this.fbAsyncInit = function() {
          FB.init({
            appId: 1919373968379030,
            cookie: true, // enable cookies to allow the server to access
            // the session
            xfbml: true, // parse social plugins on this page
            version: 'v2.8' // use graph api version 2.8
          });

          FB.getLoginStatus(function(response) {
            statusChangeCallback(response);
          }, true);

        };

        this.checkLoginState = function() {
          FB.getLoginStatus(function(response) {
            statusChangeCallback(response);
          }, true);
        }

        function statusChangeCallback(response) {
          console.log('statusChangeCallback');
          console.log(response);

          if (response.status === 'connected') {
            var uid = response.authResponse.userID;
            var accessToken = response.authResponse.accessToken;
          } else if (response.status === 'not_authorized') {
            // the user is logged in to Facebook,
            // but has not authenticated your app

            console.log('User is logged into Facebook but hasn\'t authenticated');
          } else {
            // the user isn't logged in to Facebook.
            console.log('User isn\'t logged into Facebook');
            // FB.login(function (response) {
            // 	console.log('after login');
            // 	console.log(response);
            // }, {scope: 'email'})
            var landingURL = 'https://www.facebook.com/v2.10/dialog/oauth?' +
              'client_id=1919373968379030' +
              '&redirect_uri=http://localhost:1337/v1/auth/facebook' +
              '&response_type=code' +
              '&scope=email,user_about_me';
            $window.location.href = landingURL;

            console.log('after login');
          }
        }
      }
    ])

    .service('UserProviderDataService', ['$rootScope', '$http', 'ConfigService', 'localStorageService', '$routeParams', '$window', '$location', '$document',
      function($rootScope, $http, ConfigService, localStorageService, $routeParams, $window, $locatio, $document) {
        var self = this;

        return {
          data: null
        }
      }
    ])

    .service('WebPlayerService', ['$rootScope', '$http', 'ConfigService', 'localStorageService', '$routeParams', '$window', '$location', '$document',
      function($rootScope, $http, ConfigService, localStorageService, $routeParams, $window, $locatio, $document) {
        var self = this;

        self.music = function () {
            var music = document.querySelector('.music');
            return music;
        }
      }
    ])
})(window.angular);
