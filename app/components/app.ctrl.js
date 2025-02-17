(function(angular) {
  'use strict';
  var app = angular.module('Audrix')
  .controller('AudrixAppController', ['$scope', '$http',
    '$mdSidenav', '$rootScope', '$timeout', 'ConfigService', 'localStorageService', '$location', '$window', 'WebPlayerService','hotkeys',
    function($scope, $http, $mdSidenav, $rootScope, $timeout, ConfigService, localStorageService, $location, $window, WebPlayerService, hotkeys) {
      $scope.uri = ConfigService.getOrigApiUrl();
      $rootScope.token = localStorageService.get('token');
      $rootScope.user = localStorageService.get('user');
      $scope.fbProfile = false;
      $scope.displayInFullView = false;
      $scope.search = false;
      if ($rootScope.user) {
        $scope.username = $rootScope.user.username;
      }

      if ($rootScope.user) {
        $scope.fbId = $rootScope.user.fbId;
        if ($scope.fbId) {
          $scope.fbProfile = true
        } else {
          $scope.fbProfile = false
        }
      }
      $scope.profilePic = "//graph.facebook.com/" + $scope.fbId + "/picture?type=large";
      $scope.bucketBaseUrl = "https://s3.ap-south-1.amazonaws.com/audrix-development/";
      $scope.trackThumbnailBaseUrl = "https://s3.ap-south-1.amazonaws.com/audrix-development/tracks/tracks_thumbnail/";
      $scope.image = '/assets/images/default_thumbnail.png';
      $scope.searchPlayThumbnail = false;

      $scope.isImageLoaded = false;                                                                                                                                                                                                                                                                                                                                       
      $scope.isSidebarOpen = false;
      $scope.loaded = false;
      $rootScope.play = true;
      let previousPlayed = [];
      let count = 0;

      // To prevent spacebar from scrolling down page

      document.documentElement.addEventListener('keydown', function (e) {
        if ( ( e.keycode || e.which ) == 32) {
          e.preventDefault();
        }
      }, false);

      $scope.userLoggedIn = () => {
        return ConfigService.loggedIn();
      };

      $scope.logout = () => {
        localStorageService.remove('token', 'user');
        $location.path('/');
      };

      $scope.clickToPlay = (index, trackId, md5) => {
        // console.log(index + ' ' + md5);

        let music = WebPlayerService.music();
        $scope.index = index;
        $scope.slicedPlaylist = $scope.playlist.slice($scope.index, $scope.playlist.length - 1);

        if (index === $scope.playlist.length - 1) {
          $scope.isLastTrack = true;
        }

        if ($scope.playlist[index].isPlaying === false && $scope.playlist[index].isStopped === true) {
          $scope.playmusic(index, trackId, md5);
        } else if ($scope.playlist[index].isPlaying === true && !music.paused) {
          $scope.playlist[index].isPlaying = false;
          $rootScope.play = true;
          music.pause();
        } else if ($scope.playlist[index].isPlaying === false && music.paused) {
          $scope.playlist[index].isPlaying = true;
          $rootScope.play = false;
          music.play();
        }
      }

      $scope.playmusic = (index, trackId, md5) => {
        var user = localStorageService.get('user');
        let username = user.username;

        var music = WebPlayerService.music();
        previousPlayed.push(index);
        count += 1;

        if (count === 2 && previousPlayed.length !== 0) {
          previousPlayed.reverse();
          var prevIndex = previousPlayed.pop();
          $scope.playlist[prevIndex].isPlaying = false;
          $scope.playlist[prevIndex].isStopped = true;
          count -= 1;
        }

        if (!$scope.playlist[index].isPlaying && $scope.playlist[index].isStopped) {
          $http.defaults.headers.common['Authorization'] = 'Bearer ' + $scope.token + ' ' + username;
          $http.get($scope.uri + 'getTrack/' + trackId, {
            responseType: 'arraybuffer'
          })
          .success( (response) => {
            if (response) {
              var blob = new Blob([response], {
                type: 'audio/mpeg'
              });
              localStorageService.set('history', {
                trackId: trackId
              });
              $scope.playlist[index].isPlaying = true;
              $scope.playlist[index].isStopped = false;
              $scope.play = false;
              music.src = URL.createObjectURL(blob);
              music.play();
              $scope.setTrackThumbnail(index,[],false);
            }
          });
        }
      };

      $scope.setTrackThumbnail = (index,searchList,searchPlayThumbnail,recommendation,trackInfo) => {
        if($scope.displayInFullView === false) {
          $scope.thumbnail = true;
        }
        if(searchPlayThumbnail === false && index !== null) {
          $scope.image = $scope.trackThumbnailBaseUrl + $scope.playlist[index].trackId;
          $scope.trackTitle = $scope.playlist[index].title;                                                      
          var artist = $scope.playlist[index].artist;
          $scope.trackArtists = artist[0];                  
          var album = $scope.playlist[index].album;
          $scope.trackAlbum = album;                                                                          
        } else if (recommendation === true && index === null){
          // console.log(trackInfo.trackId);
          $scope.image = $scope.trackThumbnailBaseUrl + trackInfo.trackId;
          // console.log($scope.image);
          $scope.trackTitle = trackInfo.title;
          // console.log($scope.trackTitle);
          var artist = trackInfo.artist;
          $scope.trackArtists = artist[0];
          var album = trackInfo.album;
          $scope.trackAlbum = album;
        } else {
          $scope.image = $scope.trackThumbnailBaseUrl + searchList[index].trackId;
          $scope.trackTitle = searchList[index].title;
          var artist = searchList[index].artist;
          $scope.trackArtists = artist[0];
          var album = searchList[index].album;
          $scope.trackAlbum = album;
        }

      };

      $scope.getTrackList = () => {
        $scope.$index = 0;
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + $scope.token;
        $http.get($scope.uri + 'get.track.list')
        .success( (response) => {
          if (response) {
            $scope.playlist = response.metadata;
          }
        }, function(error) {});
      };

      $scope.openTrackInfoPlayer = () => {
        $scope.thumbnail = false;
        $scope.displayInFullView = true;
        $scope.myObj = {
          "position": "relative",
          "height": "100%",
          "width": "100%",
          "background": "rgba(0, 0, 0, 1)",
          // "background-color": "#386aff",
          "opacity": "0.9"
        } ;
        $scope.backgroundCss = {
          // "background-image": "url(" + $scope.image + ")",
          "height": "100%",
          "width": "100%",
          "position": "relative",
          "background-size": "cover",
        }
        $scope.landingPageCss = {
          "display": "none"
        };

        $scope.dashboardCss = {
          "display": "none" 
        }
        $scope.footerWebPlayer = {
          "height": "90px",
          "background-color": "rgba(11, 15, 27, 0.8)" 
        }
        $scope.extraControls = {
          "transform": "translateY(50%)"
        }
        $scope.trackThumbnailWrapper = {
          "display": "none"  
        }
        $scope.nowPlayingBarLeft = {
          "margin-top": "0px"
        }
      };

      $scope.closeFullPlayerView = () => {
        $scope.thumbnail = true;
        $scope.displayInFullView = false;
        $scope.myObj = {
          "display": "none"
        };
        $scope.landingPageCss = {
          "display": "flex"
        };

        $scope.dashboardCss = {
          "display": "unset" 
        };
        $scope.footerWebPlayer = {
          "height": "90px"
        };
        $scope.extraControls = {
          "transform": "translateY(100%)"
        };
        $scope.trackThumbnailWrapper = {
          "display": "unset"  
        };
        $scope.nowPlayingBarLeft = {
          "margin-top": "16px"
        }
      }

      $scope.openSidebar = () => {
        let left_sidebar;
        if($scope.isSidebarOpen) {
          $scope.isSidebarOpen = false;
          $scope.leftSidebar = {
            "width": "80px",
            "transition": "width linear 0.5s"
          }
          $scope.dashLogo = {
            "min-width": "0px",
            "margin": "0px 0px",
            "padding": "0px 0px",
            "transition": "all ease 1s"
          }
          $scope.sidebarNavTab = {
            "padding": "5px",
          }
          $scope.sidebarIcons = {
            "font-size": "30px"
          }
          $scope.sidebarTitle = {
            "display":"none",

          }
          $scope.userProfileCircle = {
            "margin": "0 auto",
            "padding-left": "0px"
          }
          $scope.sidebarUsername = {
            "display":"none",
          }
        } else {
          $scope.isSidebarOpen = true;

          $scope.leftSidebar = {
            "width": "220px",
            "transition": "width linear 0.5s"
          }
          $scope.dashLogo = {
            "display": "inline-block",
            "min-width": "0px",
            "margin": "0px 0px",
            "padding": "0px 0px",
            "transition": "all ease 1s"
          }
          $scope.sidebarNavTab = {
            "display": "flex",
            "padding-left": "15px",
            "text-align": "left",
            "transition": "all linear 0.5s"
          }
          $scope.sidebarIcons = {
            "font-size": "22px",
            "top": "5px",
            "position": "relative"
          }
          $scope.sidebarTitle = {
            "display":"inline-block",
            "transition": "all ease 1s",
            "padding-left": "5px",
            "width": "100%"
          }
          $scope.userProfileCircle = {
            "margin": "0px",
            "padding-left": "8px"
          }
          $scope.sidebarUsername = {
            "display":"inline-block",
            "transition": "all ease 1s",
          }
        }
      }

      $scope.startRecommendation = () => {
        if(!$scope.recommendation) {

          $scope.recommendation = true;
          $scope.auzone();
        } else {
          $scope.recommendation = false;
          $scope.auzone();  
        }
        
      }

      $scope.auzone = function () {
        let history = localStorageService.get('history');
        let user = localStorageService.get('user');
        let trackId = history.trackId;
        let username = user.username;
        var slider = document.querySelector('.progress-bar__slider');
        var timer = document.querySelector('.playback-bar__progress-time');
        let music = WebPlayerService.music();
        console.log($scope.recommendation);
        if($scope.recommendation) {
          // $scope.recommendation = true;

          $http.defaults.headers.common['Authorization'] = 'Bearer ' + $scope.token + ' ' + trackId + '+' + username;
          $http.get($scope.uri + 'recommendation')
          .success( (response) => {
            if (response) {
              console.log(response);
              // $scope.recommendation = true;
              $scope.playRecommendation(response, username);

            }
          });  
        } else {
          music.pause();
          $scope.play = true;
          music.currentTime = 0;
          slider.style.width = 0;
          timer.textContent = '00:00';
          $scope.stopped = true;
          $scope.recommendation = false;
          $scope.closeFullPlayerView();
        }

      }


      $scope.playRecommendation = (response, username) => {

        let trackInfo = response.metadata;
        // let trackId = trackArr[number];
        console.log(trackInfo.trackId);

        let music = WebPlayerService.music();
        $http.defaults.headers.common['Authorization'] = 'Bearer ' + $scope.token + ' ' + trackInfo.trackId + '+' + username;
        $http.get($scope.uri + 'playrecommendation/' + trackInfo.trackId, {
          responseType: 'arraybuffer'
        })
        .success( (response) => {
          if (response) {
            var blob = new Blob([response], {
              type: 'audio/mpeg'
            });
          // $scope.searchList[index].isPlaying = true;
          // $scope.searchList[index].isStopped = false;
          $rootScope.play = false;
          music.src = URL.createObjectURL(blob);
          music.play();
          let recommendPlayThumbnail = true;
          console.log(trackInfo);
          $scope.setTrackThumbnail(null,[],false,true,trackInfo);
        }
      });
      }

    // $scope.setRecommendedTrackThumbnail = (trackInfo,recommendPlayThumbnail) => {
    //   if($scope.displayInFullView === false) {
    //     $scope.thumbnail = true;
    //   }
    //   // if(recommendPlayThumbnail === false) {
    //   //   $scope.image = $scope.trackThumbnailBaseUrl + $scope.playlist[index].trackId;
    //   //   $scope.trackTitle = $scope.playlist[index].title;
    //   //   var artist = $scope.playlist[index].artist;
    //   //   $scope.trackArtists = artist[0];
    //   //   var album = $scope.playlist[index].album;
    //   //   $scope.trackAlbum = album;  
    //   // } else {
    //     $scope.imageThumbnail = $scope.trackThumbnailBaseUrl + trackInfo.trackId;
    //     console.log($scope.image);
    //     $scope.tracktitle = trackInfo.title;
    //     console.log($scope.trackTitle);
    //     var artist = trackInfo.artist;
    //     $scope.trackartists = artist[0];
    //     var album = trackInfo.album;
    //     $scope.trackalbum = album;

    //   };

    $scope.isTokenValid = () => {
      $http.defaults.headers.common['Authorization'] = 'Bearer ' + $rootScope.token;
      $http.get($scope.uri + 'auth.validate.token')
      .success( (response) => {
        if (!response.status) {
          var currPath = $location.path();
          if ((currPath !== '/auth/login')) {
            $scope.logout();
          }
        }
        return;
      })
      .error( (data) => {
        $scope.logout();
        return;
      });
    };

    $scope.isTokenValid();
    $scope.getTrackList();
  }
  ])
.controller('LoginController', ['$scope', '$http', 'ConfigService', 'localStorageService', '$location', '$rootScope', 'UserLoginService', '$auth', 'UserProviderDataService',
  function($scope, $http, ConfigService, localStorageService, $location, $rootScope, UserLoginService, $auth, UserProviderDataService) {

    if (ConfigService.loggedIn()) {
      $location.path('/browse');
      return;
    }

    $scope.message = '';
    $scope.error = '';

    $scope.userSignup = () => {
      var params = {
        username: $scope.username,
        email: $scope.email,
        password: $scope.password,
        firstname: $scope.firstname,
        lastname: $scope.lastname,
      };

      $http.post($scope.uri + 'auth.signup', params)
      .success( (response) => {
        if (response.status) {
          if (typeof $scope.message !== undefined) {
            $scope.message = response.message;
            $location.path('/auth/login');
          }
        } else {
          if (typeof $scope.error !== undefined) {
            $scope.error = response.message;
          }
        }
      })
      .error( (data) => {
        if (typeof $scope.error !== undefined) {
          $scope.error = data.message;
        }
      });
    };

    $scope.loginSuccess = (data) => {
      localStorageService.set('token', data.token);
      localStorageService.set('user', {
        username: data.username,
        email: data.email,
      });
    };

    $scope.userLogin = () => {
      $http.defaults.headers.common['Authorization'] = 'Bearer ' + $scope.username + ':' + $scope.password;
      $http.get($scope.uri + 'auth.login')
      .success( (response) => {
        if (response.status) {
          $scope.loginSuccess(response.data);
          $location.path('/browse/');
        } else {
          $scope.error = response.message;

        }
      })
      .error( (data) => {});
    };

    $scope.authenticate = (provider) => {
      $auth.authenticate(provider).then(function(response) {
        $auth.removeToken();
        let data = response.data.cred;
        if (!response.data.exist) {
          UserProviderDataService.data = data;
          $location.path('/auth/credentials');
        } else {
          let data = response.data.data;
          localStorageService.set('token', data.token);
          localStorageService.set('user', {
            username: data.username,
            email: data.email,
            fbId: data.facebookId
          });
          $scope.username = data.username;
          $location.path('/browse');
        }
      });
    };

    $scope.usernameCheck = () => {
      $http.defaults.headers.common['Authorization'] = 'Bearer ' + $scope.username + ' ' + $scope.token;
      $http.get($scope.uri + 'username.validate')
      .success( (response) => {
        if (response.status) {
          $scope.status = response.status;
          $scope.message = response.message;
        } else {
          $scope.status = response.status;
          $scope.message = response.message;
        }
      });
    };

    $scope.submitCreds = () => {
      const params = {
        data: UserProviderDataService.data
      };
      $http.defaults.headers.common['Authorization'] = 'Bearer ' + $scope.username + ':' + $scope.password;
      $http.post($scope.uri + 'post.credentials', params)
      .success(function(response) {
        if (response.status) {
          localStorageService.set('token', response.data.token);
          localStorageService.set('user', {
            username: response.data.username,
            email: response.data.email,
          });
          $location.path('/browse');
        } else {
          $location.path('/auth/login');
        }
      });
    };

    $scope.userLogout = () => {
      localStorageService.clearAll();
      $http.post($scope.uri + 'auth.logout')
      .success( (response) => {
        if (response.status) {
          if (typeof $scope.message !== undefined) {
            $location.path('/');
          }
        } else {
          if (typeof $scope.error !== undefined) {
            $scope.error = response.message;
          }
        }
      })
      .error( (data) => {
        if (typeof $scope.error !== undefined) {
          $scope.error = data.message;
        }
      });
    };

    $scope.logout = () => {
      localStorageService.remove('token', 'user');
      $location.path('/auth/login');
    };

  }
  ])
.controller('UserController', ['$scope', '$http', 'ConfigService', 'localStorageService', '$location', '$rootScope', '$timeout', '$routeParams',
  function($scope, $http, ConfigService, localStorageService, $location, $rootScope, $timeout, $routeParams) {

    let user = localStorageService.get('user');
    let username = user.username;

    $scope.getUserInfo = () => {
      $http.defaults.headers.common['Authorization'] = 'Bearer ' + $scope.username;
      $http.get($scope.uri + 'get.user.info')
      .success( (response) => {
        if (response) {
          console.log(response);
          $scope.user = response.user;
        }
      });
    }

    $scope.userLogout = () => {
      localStorageService.remove('token', 'user');
      $location.path('/auth/login');
    };



    $scope.changePassword = () => {
     let params= {
      newPassword : $scope.newPassword,
      confirmPassword : $scope.confirmPassword,
      username : username
    }

    $http.post($scope.uri + 'auth.changePassword', params)
    .success( (response) => {
      if (response.status) {
        if (typeof $scope.message !== undefined) {
          $scope.message = response.message;
          $location.path('/auth/login');
        }
      } else {
        if (typeof $scope.error !== undefined) {
          $scope.error = response.message;
        }
      }
    })
    .error( (data) => {
      if (typeof $scope.error !== undefined) {
        $scope.error = data.message;
      }
    });

  }



    // console.log($scope)

    $scope.getUserInfo();

  }
  ])
.controller('WebPlayerController', ['$scope', '$http', 'ConfigService', 'localStorageService', '$location', 'Upload',
  '$rootScope', '$timeout', 'WebPlayerService', '$cacheFactory', '$controller',
  function($scope, $http, ConfigService, localStorageService, $location, Upload, $rootScope, $timeout, WebPlayerService, $cacheFactory, $controller) {

    $scope.user = localStorageService.get('user');
    $scope.fbProfile = false;
    $scope.displayInFullView = false;
    if ($scope.user) {
      $scope.username = $scope.user.username;
    }

    if ($scope.user) {
      $scope.fbId = $scope.user.fbId;
      if ($scope.fbId) {
        $scope.fbProfile = true
      } else {
        $scope.fbProfile = false
      }
    }
    $scope.profilePic = `//graph.facebook.com/${$scope.fbId}/picture?type=large`;

    let latest_track_thumbnail = document.querySelector('.latest_track_thumbnail');

    $scope.userLogout = () => {
      localStorageService.remove('token', 'user');
      $location.path('/auth/login');
    };
  }
  ])

.controller('UploadFileController', ['$scope', '$http', 'ConfigService', 'localStorageService', '$location', 'Upload', '$timeout', '$q',
  function($scope, $http, ConfigService, localStorageService, $location, Upload, $timeout, $q) {

    $scope.uri = ConfigService.getOrigApiUrl();
    $scope.token = localStorageService.get('token');
    $scope.isUploadDone = true;
    $scope.isTrackFeatureDone = false;
    $scope.isElasticDone = false;
    $scope.isMessage = false;

    $scope.doAll = (file) => {
      const params = {
        trackId: $scope.trackId,
        filename: $scope.file.filename
      };

      $scope.loading = true;

      upload(file).then( (result) => {
        addTrackFeatures(result[0],result[1]).then( (result) => {
          addToElastic(result[0]).then( (result) => {
            $scope.loading = false;
          });
        });
      });
    };

    function upload(file) {
      var deferred = $q.defer();
      var fileUpload = this;
      Upload.upload({
        url: $scope.uri + 'post.track', //webAPI exposed to upload the file
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + $scope.token
        },
        data: {
          filename: file[0].name,
          file: file[0] //pass file as data, should be user ng-model
        }
      }).then( (resp) => {
        var data = [];
        $scope.trackId = resp.data.trackId;
        $scope.file = resp.data.filename;
        $scope.message = resp.data.message;
        $scope.isMessage = false;
        data.push($scope.trackId);
        data.push($scope.file.filename);
        data.push($scope.message);
        $timeout(function() {
          $scope.isMessage = true;
        }, 2000);
        // $timeout( () => {
        //   $scope.uploadAnimate = false;
        // }, 3000);
        // $scope.isUploadDone = false;
        // $scope.isTrackFeatureDone = true;  
        deferred.resolve(data);
      }, (resp) => {
        console.log('Error status: ' + resp.status);
        deferred.reject();
      },
      function(evt) {
        file.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
        $scope.progressPercent = file.progressPercentage + '%';
        if (file.progressPercentage === 100) {
          $scope.progressCompletion = evt.config.data.file.name;
        }
      });
      return deferred.promise;
    };

    function addTrackFeatures(trackId, filename) {
      console.log(filename);
      var deferred = $q.defer();
      const params = {
        trackId: trackId,
        filename: filename
      };

      $http.post($scope.uri + 'addTrackFeatures', params)
      .success( (response) => {
        if (response.status) {
          var data = [];
          $scope.message = response.message;
          $scope.isMessage = false;
          $timeout(function() {
            $scope.isMessage = true;
          }, 2000);
          // $scope.isTrackFeatureDone = false;
          // $scope.isElasticDone = true;
          data.push(trackId);
          data.push($scope.message);
          deferred.resolve(data);
        }
      })
      .error( (data) => {
        deferred.reject();
      });

      return deferred.promise;
    };

    function addToElastic(trackId) {
      var deferred = $q.defer();
      const params = {
        trackId: trackId
      };

      $http.post($scope.uri + 'addToElastic', params)
      .success( (response) => {
        if (response.status) {
          var data = [];
          $scope.message = response.message;
          $scope.isMessage = false;
          $timeout(function() {
            $scope.isMessage = true;
          }, 2000);
          // $scope.isElasticDone = false;
          // $scope.isUploadDone = true;
          // $scope.isTrackFeatureDone = false;
          data.push(trackId);
          data.push($scope.message);
          deferred.resolve(data);
        }
      })
      .error( (data) => {
        deferred.reject();
      });
      return deferred.promise;
    };
  }
  ])

.controller('SearchController', ['$scope', '$http', 'ConfigService', 'localStorageService', '$location', 'WebPlayerService', '$rootScope',
  function($scope, $http, ConfigService, localStorageService, $location, WebPlayerService, $rootScope) {

    let previousPlayed = [];
    let count = 0;
    $scope.searchPlayThumbnail = false;
    $scope.searchResults = false;

    const searchBox = document.querySelector('#searchBox');
    searchBox.addEventListener('keydown', function (e) {
      e.stopPropagation();
    });

    $scope.Search = (searchText) => {

      const params = {
        q: searchText
      }

      $http.post($scope.uri + 'search', params)
      .success( (response) => {
        if (response.status) {
          if(response.data.length <= 0) {
            $scope.searchResults = false;
            $scope.searchList = response.data;  
          } else {
            $scope.searchResults = true;
            $scope.searchList = response.data;  
          }
          
        }
      })
      .error( (data) => {

      });
    }

    $scope.clickToPlaySearchedMusic = (index, trackId, md5) => {
      console.log(index + ' ' + md5);

      let music = WebPlayerService.music();
      $scope.index = index;
        // $scope.searchedSlicedPlaylist = $scope.searchList.slice($scope.index, $scope.searchList.length - 1);

        // if (index === $scope.searchList.length - 1) {
        //   $scope.isLastTrack = true;
        // }
        if ($scope.searchList[index].isPlaying === false && $scope.searchList[index].isStopped === true) {
          $scope.playSearchedMusic(index, trackId, md5);
        } else if ($scope.searchList[index].isPlaying === true && !music.paused) {
          $scope.searchList[index].isPlaying = false;
          $rootScope.play = true;
          music.pause();
        } else if ($scope.searchList[index].isPlaying === false && music.paused) {
          $scope.searchList[index].isPlaying = true;
          $rootScope.play = false;
          music.play();
        }
      }

      $scope.playSearchedMusic = (index, trackId, md5) => {
        var music = WebPlayerService.music();
        previousPlayed.push(index);
        count += 1;

        if (count === 2 && previousPlayed.length !== 0) {
          previousPlayed.reverse();
          var prevIndex = previousPlayed.pop();
          $scope.searchList[prevIndex].isPlaying = false;
          $scope.searchList[prevIndex].isStopped = true;
          count -= 1;
        }

        if (!$scope.searchList[index].isPlaying && $scope.searchList[index].isStopped) {
          $http.defaults.headers.common['Authorization'] = 'Bearer ' + $scope.token;
          $http.get($scope.uri + 'getTrack/' + trackId, {
            responseType: 'arraybuffer'
          })
          .success( (response) => {
            if (response) {
              var blob = new Blob([response], {
                type: 'audio/mpeg'
              });
              $scope.searchList[index].isPlaying = true;
              $scope.searchList[index].isStopped = false;
              $rootScope.play = false;
              music.src = URL.createObjectURL(blob);
              music.play();
              let searchPlayThumbnail = true;
              $scope.setTrackThumbnail(index,$scope.searchList,searchPlayThumbnail);
            }
          });
        }
      };
    }
    ])

.controller('RecommendationController', ['$scope', '$http', 'ConfigService', 'localStorageService', '$location', '$rootScope', 'WebPlayerService',
  function($scope, $http, ConfigService, localStorageService, $location, $rootScope, WebPlayerService) {  

    $scope.recommendation = false;
    let music = WebPlayerService.music();

    
  }
  ])
.controller('ExploreController', ['$scope', '$http', 'ConfigService', 'localStorageService', '$location',
  function($scope, $http, ConfigService, localStorageService, $location) {

    $scope.getExploreList = () => {
      $scope.$index = 0;
      $http.defaults.headers.common['Authorization'] = 'Bearer ' + $scope.token;
      $http.get($scope.uri + 'get.explore.list')
      .success( (response) => {
        if (response) {
          $scope.playlist = response.metadata;
        }
      }, function(error) {});
    }; 
    $scope.getExploreList();
  }
  ])

.controller('Controller', ['$scope', '$http', 'ConfigService', 'localStorageService', '$location',
  function($scope, $http, ConfigService, localStorageService, $location) {

  }
  ]);
})(window.angular);
