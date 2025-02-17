(function (angular) {
	'use strict';
	var app = angular.module('Audrix');

	app.service('ConfigService', [ '$rootScope','localStorageService', '$location', '$http', '$window',
		function ($rootScope, localStorageService, $location, $http, $window) {

			var myService = this;

			var proto = location.protocol;

			var config = {};
			initConfig(config);

			this.getConfig = function () {
				var conf = config[location.hostname];
				if (typeof conf === 'undefined') {
					conf = null;
				}
				return conf;
			};

			this.getOrigApiUrl = function () {
				var conf = this.getConfig();
				if (conf !== null) {
					return proto + '//' +
					conf.apiOrigHost + '/' +
					conf.apiVersion + '/';
				}
				return '';
			};

			this.loggedIn = function () {
                var token = localStorageService.get('token');
                if ((token === null) || (token === '')) {
                    return false;
                }
                return true;
            };

		}]);
})(window.angular);

var initConfig = function (config) {
	config['www.audrix.live'] = {
		apiOrigHost: 'localhost:1337',
		apiVersion: 'v1'
	};
};
