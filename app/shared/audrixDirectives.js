var app = angular.module('Audrix');

app.directive('audrixHeader', () => {
  return {
    restrict: 'E',
    templateUrl: 'app/components/header.html',
    controller: ['$rootScope', '$scope', '$mdSidenav',
    ($rootScope, $scope, $mdSidenav) => {

      $scope.showMobileMainHeader = true;
      $scope.openSideNavPanel = function() {
        $mdSidenav('left').open();
      };
      $scope.closeSideNavPanel = () => {
        $mdSidenav('left').close();
      };
    }
    ]
  };
});

app.directive('audrixFooter', () => {
  return {
    restrict: 'E',
    templateUrl: 'app/components/footer.html',
    controller: ['$rootScope', '$scope',
    ($rootScope, $scope) => {
        // body...
      }
      ]
    }
  });

app.directive('audrixDashboardHeader', () => {
  return {
    restrict: 'E',
    templateUrl: 'app/components/dashboardHeader.html',
    controller: ['$rootScope', '$scope', '$mdSidenav',
    function($rootScope, $scope, $mdSidenav) {

      $scope.showMobileMainHeader = true;
      $scope.openSideNavPanel = function() {
        $mdSidenav('left').open();
      };
      $scope.closeSideNavPanel = function() {
        $mdSidenav('left').close();
      };
    }
    ]
  };
});

app.directive('audrixWebPlayer', function() {
  return {
    restrict: 'E',
    require: ['AudrixAppController'],
    templateUrl: 'app/components/web-player/player.html',
    controller: ['$rootScope', '$scope', 'WebPlayerService', 'hotkeys',
    function($rootScope, $scope, WebPlayerService, hotkeys) {
      var music = WebPlayerService.music();
      var slider = document.querySelector('.progress-bar__slider');
      var sliderHead = document.querySelector('.slider-head');
      var timer = document.querySelector('.playback-bar__progress-time');
      var totalTime = document.querySelector('.playback-bar__total-progress-time');
      var timeline = document.querySelector('.progress-bar__bg');
      var timelineWidth = timeline.offsetWidth - slider.offsetWidth;

      var playlist = [];
      $scope.isLastTrack = false;

      // var track_thumbnail_wrapper = document.querySelector('.track-thumbnail_wrapper');
      // var marqueeDiv = document.querySelector('.track-info_artists');
      // console.log(marqueeDiv);
      // console.log(track_thumbnail_wrapper);
      // console.log(track_thumbnail_wrapper.getClientRects()[0]);
      // console.log(marqueeDiv.getClientRects()[0]);
      // if(marqueeDiv.getClientRects()[0].width > track_thumbnail_wrapper.getClientRects()[0].width) {
      //   marqueeDiv.addClass('marquee');
      // } else {
      //   marqueeDiv.removeClass('marquee');
      // }

      var volumeTimeline = document.querySelector('.progress-bar__bgv');
      var volumeSlider = document.querySelector('.progress-bar__volumeSlider');
      var volumeTimelineWidth = volumeTimeline.offsetWidth - volumeSlider.offsetWidth;

      volumeSlider.style.width = 75 + "%";
      music.volume = 0.75;
      let percentage = 75;

      // $scope.play = true;
      $scope.volumeOff = false;
      $scope.volumeUp = true;
      $scope.volumeDown = false;
      $scope.volumeMute = false;

      volumeTimeline.addEventListener("click", volumeClick, false);
      volumeSlider.addEventListener('mousedown', mouseDownv, false);
      volumeSlider.addEventListener('mouseup', mouseUpv, false);

      var onvolumehead = false;

      var upVolume, downVolume, upBool, downBool;

      function volumeClick() {
        var offset = volumeTimeline.getClientRects()[0];
        var sliderOffset = volumeSlider.getClientRects()[0];
        var position = event.clientX - offset.left;
        percentage = 100 * position / offset.width;
        if (position > offset.width) {
          music.volume = 1;
        } else if (position < 0) {
          music.volume = 0;
        } else {
          music.volume = (percentage / 100).toFixed(2);
        }
        volumeSlider.style.width = percentage + "%";

        if (music.volume === 0) {
          $scope.$apply(function() {
            $scope.volumeOff = true;
            $scope.volumeUp = false;
            $scope.volumeDown = false;
            $scope.volumeMute = false;
          })
        } else if (music.volume > 0.5) {
          $scope.$apply(function() {
            $scope.volumeUp = true;
            $scope.volumeDown = false;
            $scope.volumeOff = false;
            $scope.volumeMute = false;
          })
        } else if (music.volume < 0.5) {
          $scope.$apply(function() {
            $scope.volumeDown = true;
            $scope.volumeUp = false;
            $scope.volumeOff = false;
            $scope.volumeMute = false;
          })
        }
      }

      function mouseDownv() {
        onvolumehead = true;
        volumeSlider.addEventListener('mousemove', movevolumehead, true);
      }

      function mouseUpv(event) {
        if (onvolumehead == true) {

          volumeSlider.removeEventListener('mousemove', movevolumehead, true);
          // change current time
          var offset = volumeTimeline.getClientRects()[0];
          var sliderOffset = volumeSlider.getClientRects()[0];
          var position = event.clientX - offset.left;
          percentage = 100 * position / offset.width;
          music.volume = (percentage / 100).toFixed(1);
          if (position > offset.width) {
            music.volume = 1;
          }

          volumeSlider.style.width = percentage + "%";
        }
        onvolumehead = false;
      }

      function movevolumehead(event) {
        var offset = volumeTimeline.getClientRects()[0];
        var sliderOffset = volumeSlider.getClientRects()[0];
        var position = Math.floor(event.clientX - offset.left);
        if (position > offset.width) {
          percentage = 100;
        } else if (position < 0) {
          music.volume = 0;
        } else {
          percentage = (100 * position / offset.width).toFixed(0);
        }
        volumeSlider.style.width = percentage + "%";
      }

      function getPosition(el) {
        return el.getBoundingClientRect().left;
      }

      $scope.playAudio = function() {
        if (music.paused) {
          music.play();
          $scope.play = false;
          $scope.playlist[$scope.index].isPlaying = true;
        } else {
          music.pause();
          $scope.play = true;
          $scope.playlist[$scope.index].isPlaying = false;
        }

      }

      hotkeys.add({
        combo: 'space',
        description: 'Play/Pause',
        callback: function() {
          $scope.playAudio();
        }
      });

      hotkeys.add({
        combo: '+',
        description: 'Volume Up',
        callback: function() {
          if(music.volume < 1) {
            music.volume += 0.05;
            music.volume = music.volume.toFixed(2);
            percentage += 5;
            volumeSlider.style.width = percentage + "%";
          } else {
            music.volume = 1;
            percentage = 100;
            volumeSlider.style.width = percentage + "%";
          }

          if (music.volume === 0) {
            $scope.volumeOff = true;
            $scope.volumeUp = false;
            $scope.volumeDown = false;
            $scope.volumeMute = false;
          } else if (music.volume > 0.5) {
            $scope.volumeUp = true;
            $scope.volumeDown = false;
            $scope.volumeOff = false;
            $scope.volumeMute = false;
          } else if (music.volume < 0.5) {
            $scope.volumeDown = true;
            $scope.volumeUp = false;
            $scope.volumeOff = false;
            $scope.volumeMute = false;
          }
        }
      });

      hotkeys.add({
        combo: '-',
        description: 'Volume Down',
        callback: function() {
          if(music.volume > 0) {
            music.volume -= 0.05;
            music.volume = music.volume.toFixed(2);
            percentage -= 5;
            volumeSlider.style.width = percentage + "%";
          } else {
            music.volume = 0;
            percentage = 0;
            volumeSlider.style.width = percentage + "%";
          }

          if (music.volume === 0) {
            $scope.volumeOff = true;
            $scope.volumeUp = false;
            $scope.volumeDown = false;
            $scope.volumeMute = false;
          } else if (music.volume > 0.5) {
            $scope.volumeUp = true;
            $scope.volumeDown = false;
            $scope.volumeOff = false;
            $scope.volumeMute = false;
          } else if (music.volume < 0.5) {
            $scope.volumeDown = true;
            $scope.volumeUp = false;
            $scope.volumeOff = false;
            $scope.volumeMute = false;
          }
        }
      });

      hotkeys.add({
        combo: 'm',
        description: 'Mute Song',
        callback: function() {
          if(music.muted) {
            music.muted = false;
            if (music.volume === 0) {
              $scope.volumeOff = true;
              $scope.volumeUp = false;
              $scope.volumeDown = false;
              $scope.volumeMute = false;
            } else if (music.volume > 0.5) {
              $scope.volumeUp = true;
              $scope.volumeDown = false;
              $scope.volumeOff = false;
              $scope.volumeMute = false;
            } else if (music.volume < 0.5) {
              $scope.volumeDown = true;
              $scope.volumeUp = false;
              $scope.volumeOff = false;
              $scope.volumeMute = false;
            }
            volumeSlider.style.width = percentage + "%";
          } else {
            music.muted = true;
            if (music.volume === 0) {
              $scope.volumeOff = true;
              $scope.volumeUp = false;
              $scope.volumeDown = false;
              $scope.volumeMute = false;
            } else if (music.volume > 0.5) {
              $scope.volumeUp = false;
              $scope.volumeDown = false;
              $scope.volumeOff = true;
              $scope.volumeMute = false;
            } else if (music.volume < 0.5) {
              $scope.volumeDown = false;
              $scope.volumeUp = false;
              $scope.volumeOff = true;
              $scope.volumeMute = false;
            }
            volumeSlider.style.width = percentage + "%";
          }
        }
      });

      $scope.playPreviousTrack = function() {
        var playlist = $scope.slicedPlaylist;
        console.log($scope.slicedPlaylist);
        if (playlist.length > 0) {
          $scope.clickToPlay($scope.index - 1, $scope.playlist[$scope.index - 1].trackId, $scope.playlist[$scope.index - 1].md5);
        }
      };

      $scope.playNextTrack = function() {
        var playlist = $scope.slicedPlaylist;
        if (playlist.length > 0) {
          $scope.clickToPlay($scope.index + 1, $scope.playlist[$scope.index + 1].trackId, $scope.playlist[$scope.index + 1].md5);
        }
      };

      hotkeys.add({
        combo: 'f',
        description: 'FullScreen Player',
        callback: function() {
          $scope.openTrackInfoPlayer();
        }
      });

      hotkeys.add({
        combo: 'esc',
        description: 'FullScreen Player',
        callback: function() {
          $scope.closeFullPlayerView();
        }
      });

      this.soundControl = function() {
        if (!$scope.volumeMute) {
          if (music.volume > 0.5) {
            upBool = true;
            upVolume = music.volume;
            // $scope.volumeOff = true;
            $scope.volumeUp = false;
            $scope.volumeDown = false;
            $scope.volumeMute = true;
            music.volume = 0;
            volumeSlider.style.width = 0 + "%";
          } else {
            upBool = false;
            downVolume = music.volume;
            // $scope.volumeOff = true;
            $scope.volumeUp = false;
            $scope.volumeDown = false;
            $scope.volumeMute = true;
            music.volume = 0;
            volumeSlider.style.width = 0 + "%";
          }
        } else {
          if (upBool) {
            $scope.volumeMute = false;
            $scope.volumeUp = true;
            music.volume = upVolume;
            var percent = music.volume * 100;
            volumeSlider.style.width = percent + "%";
          } else {
            $scope.volumeMute = false;
            $scope.volumeDown = true;
            music.volume = downVolume;
            var percent = music.volume * 100;
            volumeSlider.style.width = percent + "%";
          }
        }
      }

      /*-----------------------------------------------------------------*/
      /*----------- Functions for Music Control ------------------------*/
      /*-----------------------------------------------------------------*/

      music.addEventListener("timeupdate", timeUpdate, false);
      music.addEventListener("canplaythrough", canPlayThrough);
      music.addEventListener("ended", ended);
      timeline.addEventListener("click", musicTimelineClick, false);

      function canPlayThrough() {
        var duration = music.duration;
        var minutes = Math.floor(duration / 60);
        var seconds = Math.floor(duration - minutes * 60);
        var minuteValue;
        var secondValue;

        if (minutes < 10) {
          minuteValue = '0' + minutes;
        } else {
          minuteValue = minutes;
        }

        if (seconds < 10) {
          secondValue = '0' + seconds;
        } else {
          secondValue = seconds;
        }

        songDuration = minuteValue + ':' + secondValue;
        totalTime.textContent = songDuration;
      }

      function timeUpdate() {
        var minutes = Math.floor(music.currentTime / 60);
        var seconds = Math.floor(music.currentTime - minutes * 60);
        var minuteValue;
        var secondValue;

        if (minutes < 10) {
          minuteValue = '0' + minutes;
        } else {
          minuteValue = minutes;
        }

        if (seconds < 10) {
          secondValue = '0' + seconds;
        } else {
          secondValue = seconds;
        }

        mediaTime = minuteValue + ':' + secondValue;
        timer.textContent = mediaTime;

        var barLength = 100 * (music.currentTime / music.duration);
        slider.style.width = barLength + '%';
      }

      function ended() {
        // console.log($scope.recommendation);
        slider.style.width = 0;
        timer.textContent = '00:00';
        $scope.stopped = true;        
        var playlist = $scope.slicedPlaylist;
        if ($scope.recommendation) {
          // console.log($scope.recommendation);
          $scope.auzone();
        }
        if (playlist.length > 0) {
          $scope.playlist[$scope.index].isPlaying = false;
          $scope.playlist[$scope.index].isStopped = true;
          $scope.clickToPlay($scope.index + 1, $scope.playlist[$scope.index + 1].trackId, $scope.playlist[$scope.index + 1].md5);
        } else {
          $scope.$apply(function() {
            $scope.play = true;
          });
        }
      }

      function musicTimelineClick(event) {
        moveplayhead(event);
        var offset = this.getClientRects()[0];
        var sliderOffset = slider.getClientRects()[0];
        var d = music.duration / offset.width;
        if ((event.clientX - offset.left) > 0) {
          music.currentTime = (event.clientX - offset.left) * d;
        }
      }

      // makes playhead draggable
      slider.addEventListener('mousedown', mouseDown, false);
      window.addEventListener('mouseup', mouseUp, false);

      // Boolean value so that audio position is updated only when the playhead is released
      var onplayhead = false;

      function mouseDown() {
        onplayhead = true;
        window.addEventListener('mousemove', moveplayhead, true);
      }

      function mouseUp(event) {
        if (onplayhead == true) {
          window.removeEventListener('mousemove', moveplayhead, true);
          // change current time
          var offset = timeline.getClientRects()[0];
          var sliderOffset = slider.getClientRects()[0];
          var d = music.duration / offset.width;
          music.currentTime = (event.clientX - offset.left) * d;
          music.addEventListener('timeupdate', timeUpdate, false);
        }
        onplayhead = false;
      }

      function moveplayhead(event) {
        var offset = timeline.getClientRects()[0];
        var sliderOffset = slider.getClientRects()[0];
        var d = music.duration / offset.width;
        var newSliderWidth = (event.clientX - offset.left);
        if (newSliderWidth >= 0 && newSliderWidth <= timelineWidth) {
          slider.style.width = newSliderWidth + "px";
        }
        if (newSliderWidth < 0) {
          slider.style.width = "0px";
        }
        if (newSliderWidth > timelineWidth) {
          slider.style.width = timelineWidth + "px";
        }
      }

      function getPosition(el) {
        return el.getBoundingClientRect().left;
      }


      hotkeys.add({
        combo: 'right',
        description: 'Seek Forward',
        callback: function() {
          music.currentTime += 5;
        }
      });

      hotkeys.add({
        combo: 'left',
        description: 'Seek Backward',
        callback: function() {
          music.currentTime -= 5;
        }
      });

      hotkeys.add({
        combo: 'ctrl+right',
        description: 'Play Next Song',
        callback: function() {
          $scope.playNextTrack();
        }
      });

      hotkeys.add({
        combo: 'ctrl+left',
        description: 'Play Previous Song',
        callback: function() {
          $scope.playPreviousTrack();
        }
      });


      /* ----- Buffering Code ---------*/

      // var bufferSlider = document.querySelector('.progress-bar__buffer-slider');

      // music.addEventListener("progress", loop, false);

      // var count = 1,
      // range = 0;

      // function loop() {
      //   var duration = music.duration;
      //   var buffered = music.buffered;
      //   var loaded;
      //   var played;

      //   for (var i = 0; i < buffered.length; i++) {
      //     var leadingEdge = buffered.start(i) / duration * 100;
      //     var trailingEdge = buffered.end(i) / duration * 100;
      //     // loaded = 100 * (trailingEdge / music.duration);
      //     loaded = trailingEdge;
      //     bufferSlider.style.width = loaded.toFixed(2) + "%";
      //   }
      // }


      /* ----------- Buffering Code ended ------- */


      /*-----------------------------------------------------------------*/
      /*----------- Functions for Full View Music Control ---------------*/
      /*-----------------------------------------------------------------*/


      var full_view_slider = document.querySelector('.full_view-progress-bar__slider');
      var full_view_sliderHead = document.querySelector('.full_view-slider-head');
      var full_view_timer = document.querySelector('.full_view-playback-bar__progress-time');
      var full_view_totalTime = document.querySelector('.full_view-playback-bar__total-progress-time');
      var full_view_timeline = document.querySelector('.full_view-progress-bar__bg');
      var full_view_timelineWidth = full_view_timeline.offsetWidth - full_view_slider.offsetWidth;


      music.addEventListener("timeupdate", full_view_timeUpdate, false);
      music.addEventListener("canplaythrough", full_view_canPlayThrough);
      timeline.addEventListener("click", full_view_musicTimelineClick, false);

      function full_view_canPlayThrough() {
        var duration = music.duration;
        var minutes = Math.floor(duration / 60);
        var seconds = Math.floor(duration - minutes * 60);
        var minuteValue;
        var secondValue;

        if (minutes < 10) {
          minuteValue = '0' + minutes;
        } else {
          minuteValue = minutes;
        }

        if (seconds < 10) {
          secondValue = '0' + seconds;
        } else {
          secondValue = seconds;
        }

        songDuration = minuteValue + ':' + secondValue;
        full_view_totalTime.textContent = songDuration;
      }

      function full_view_timeUpdate() {
        var minutes = Math.floor(music.currentTime / 60);
        var seconds = Math.floor(music.currentTime - minutes * 60);
        var minuteValue;
        var secondValue;

        if (minutes < 10) {
          minuteValue = '0' + minutes;
        } else {
          minuteValue = minutes;
        }

        if (seconds < 10) {
          secondValue = '0' + seconds;
        } else {
          secondValue = seconds;
        }

        mediaTime = minuteValue + ':' + secondValue;
        full_view_timer.textContent = mediaTime;

        var barLength = 100 * (music.currentTime / music.duration);
        full_view_slider.style.width = barLength + '%';
      }

      function full_view_musicTimelineClick(event) {
        moveplayhead(event);
        var offset = this.getClientRects()[0];
        var sliderOffset = slider.getClientRects()[0];
        var d = music.duration / offset.width;
        if ((event.clientX - offset.left) > 0) {
          music.currentTime = (event.clientX - offset.left) * d;
        }
      }

      // makes playhead draggable
      full_view_slider.addEventListener('mousedown', full_view_mouseDown, false);
      window.addEventListener('mouseup', full_view_mouseUp, false);

      // Boolean value so that audio position is updated only when the playhead is released
      var full_view_onplayhead = false;

      function full_view_mouseDown() {
        full_view_onplayhead = true;
        window.addEventListener('mousemove', full_view_moveplayhead, true);
      }

      function full_view_mouseUp(event) {
        if (full_view_onplayhead == true) {
          window.removeEventListener('mousemove', full_view_moveplayhead, true);
          // change current time
          var offset = full_view_timeline.getClientRects()[0];
          var sliderOffset = full_view_slider.getClientRects()[0];
          var d = music.duration / offset.width;
          music.currentTime = (event.clientX - offset.left) * d;
          music.addEventListener('timeupdate', full_view_timeUpdate, false);
        }
        full_view_onplayhead = false;
      }

      function full_view_moveplayhead(event) {
        var offset = full_view_timeline.getClientRects()[0];
        var sliderOffset = full_view_slider.getClientRects()[0];
        var d = music.duration / offset.width;
        var newSliderWidth = (event.clientX - offset.left);
        if (newSliderWidth >= 0 && newSliderWidth <= full_view_timelineWidth) {
          full_view_slider.style.width = newSliderWidth + "px";
        }
        if (newSliderWidth < 0) {
          full_view_slider.style.width = "0px";
        }
        if (newSliderWidth > full_view_timelineWidth) {
          full_view_slider.style.width = full_view_timelineWidth + "px";
        }
      }

      function getPosition(el) {
        return el.getBoundingClientRect().left;
      }
    }
    ]
  };
});

app.directive("scroll", ($window) => {
  return (scope, element, attrs) => {
    angular.element($window).bind("scroll", function() {
      if (this.pageYOffset >= 100) {
        // $('#toolbar').removeClass('.toolbar_not_scroll');
        $scope.boolChangeClass = true;
      } else {
        // $('#toolbar').addClass('.toolbar_not_scroll');
        scope.boolChangeClass = false;
      }
      scope.$apply();
    });
  };
});

app.directive('fileModel', ['$parse', ($parse) => {
  return {
    restrict: 'A',
    link: (scope, element, attrs) => {
      var input = $(element[0].querySelector('#fileInput'));
      var button = $(element[0].querySelector('#browseButton'));
      var textInput = $(element[0].querySelector('#textInput'));

      if (input.length && button.length && textInput.length) {
        button.click(function(e) {
          input.click();
        });
        textInput.click(function(e) {
          input.click();
        });
      }

      input.on('change', function(e) {
        var files = e.target.files;
        if (files[0]) {
          scope.fileName = files[0].name;
        } else {
          scope.fileName = null;
        }
        scope.$apply();
      });
    }
  };
}]);

app.directive('audrixSidebar', function() {
  return {
    restrict: 'E',
    templateUrl: 'app/components/sidebar.html',
    controller: ['$rootScope', '$scope', 'localStorageService', '$location',
    ($rootScope, $scope, localStorageService, $location) => {
      $scope.userLogout = () => {
        localStorageService.remove('token', 'user');
        $location.path('/auth/login');
      };
    }
    ]
  }
});

app.directive('loading', function () {
  return {
    restrict: 'EAC',
    replace:true,
    template: '<div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>',
    link: function (scope, element, attr) {
      scope.$watch('loading', function (val) {
        val = val ? $(element).show() : $(element).hide();  // Show or Hide the loading image
      });
    }
  }
});

app.directive('imageonload', function ($timeout) {
  return {
    restrict: 'A',
    replace: true,
    link: function (scope, element, attrs) {
      var defaultLoaderClass = 'ngImageAppearLoader',
      defaultPlaceholderClass = 'ngImageAppearPlaceholder';

      // Fetching element attributes
      var transitionDurationAttr = attrs.transitionDuration, // Set transition duration
          noLoaderAttr = element[0].hasAttribute('no-loader'), // Check if loader is to be hidden
          placeholderAttr = attrs.placeholder, // Check if default placeholder image is to be shown
          placeholderClassAttr = attrs.placeholderClass, // Set CSS class for placeholder (image wrapper)
          placeholderStyleAttr = attrs.placeholderStyle, // Set CSS styles for placeholder (image wrapper)
          bgColorAttr = attrs.bgColor, // Set loader wrapper background color
          loaderImgAttr = attrs.loaderImg, // Set custom loader image
          loaderClassAttr = attrs.loaderClass, // Set CSS class for loader element
          loaderStyleAttr = attrs.loaderStyle, // Set custom styles for loader element
          animationDurationAttr = attrs.animationDuration, // Set animation duration
          animationAttr = attrs.animation, // Set animation type
          isResponsiveAttr = element[0].hasAttribute('responsive'), // Check if image is to be set responsive or not
          easingAttr = attrs.easing; // Set easing for transition/animation

      // Setting default loader attributes

      loaderObject = {
        'className': defaultLoaderClass
      };

      // Attach CSS class to loader element if attribute is present
      if(loaderClassAttr !== undefined) {
        loaderObject.className += ' '+loaderClassAttr;
      }

      // Set custom styles for loader element if attribute is present
      if(loaderStyleAttr !== undefined && loaderStyleAttr !== '') {
        loaderObject.style = loaderStyleAttr;
      }

      // Setting values for element attributes
      transitionDurationAttr = !transitionDurationAttr ? 0.7+'s' : transitionDurationAttr; // Set transition duration, default - 700ms
      bgColorAttr = bgColorAttr, // Set default bg color for loader wrapper
      animationDurationAttr = !animationDurationAttr ? 0.7+'s' : animationDurationAttr; // Set transition duration, default - 700ms
      easingAttr = !easingAttr ? 'ease-in-out' : easingAttr; // Set easing for transition, default - ease-in-out

      // Set custom loader image if present
      loaderObject.src = loaderImgAttr ? loaderImgAttr : loaderSrc;

      // DOM manipulation element variable declarations
      var imgElement,
      parentElement,
      imgWrapper,
      loaderElement,
      wrapperStyles = 'background-color: '+bgColorAttr+'; ',
      setImageElementWidth,
      isSmall = false,
      hasShownLoader = false,
      animationText;

      // Add placeholder image if attribute is present
      if(placeholderAttr !== undefined) {
        if(placeholderAttr === '') {
              // Set default placeholder
              wrapperStyles += 'background-image: url('+defaultPlaceholder+'); ';
            }
            else {
              // Set custom placeholder
              wrapperStyles += 'background-image: url('+placeholderAttr+'); ';
            }
          }

      // Function to render loader
      function renderLoader() {

          // Show loader in DOM
          function showLoader() {
            loaderElement = document.createElement('img');

              // Adding loader object properties to loader element
              for(var key in loaderObject) {
                loaderElement[key] = loaderObject[key];
              }

              // Set loader element's visual styles to null
              loaderElement.style.margin = loaderElement.style.padding =  loaderElement.style.border = loaderElement.style.borderRadius = 0;
              loaderElement.style.boxShadow = loaderElement.style.float = 'none';
              loaderElement.style.transform = loaderElement.style.outline = '';

              // Add loader to DOM
              imgWrapper.appendChild(loaderElement);
              hasShownLoader = true;
            }

          // Check custom loader image extension
          if(loaderImgAttr) {

              // Get filetype of image
              var fileType = loaderImgAttr.split('.').pop();
              fileType = fileType.substring(0,3);

              // Show loader if svg file is present
              if(fileType === 'svg') {
                showLoader();
              }
              // Else throw warning in console
              else {
                console.warn('The custom loader image should have a proper svg extension. Read full documentation here - https://github.com/ArunMichaelDsouza/ng-image-appear');
              }
            }
            else {
              showLoader();
            }
          }

      // Function to remove loader element from DOM
      function removeLoader() {

          // Check for loader visibility flags
          if(!isSmall && !noLoaderAttr && hasShownLoader) {
              var elementLoader = element[0].nextSibling; // Get loader of current element
              if(elementLoader) {
                elementLoader.parentNode.removeChild(elementLoader); // Remove rendered loader from DOM
              }
            }
          }

      // Function to remove wrapper element from DOM
      function removeImgWrapper() {

          // Interval to check that image wrapper has been rendered in DOM
          var intervalRemove = setInterval(function() {
            if(imgWrapper !== undefined) {
              clearInterval(intervalRemove);

                  // Reset img wrapper CSS
                  imgWrapper.style.backgroundColor = imgWrapper.style.position = imgElement.style.width = imgElement.style.padding = imgElement.style.margin = imgElement.style.border = imgElement.style.borderRadius = imgElement.style.boxShadow = imgElement.style.float = imgElement.style.transform = imgElement.style.outline = '';

                  var wrapper = element[0].parentNode,
                  wrapperParent = wrapper.parentNode;
                  wrapperParent.replaceChild(element[0], wrapper); // Replace wrapper with actual image element
                }
              }, 1);
        }

      // Function to render image wrapper in DOM
      function renderImageWrapper(imgElementWidth, parentElementWidth, imgElementStyles) {

          // Append placeholder styles to image wrapper if attribute is present
          if(placeholderStyleAttr !== undefined && placeholderStyleAttr !== '') {
            wrapperStyles += placeholderStyleAttr;
          }

          imgWrapper = document.createElement('div'); // Create wrapper element for image
          imgWrapper.setAttribute('style', wrapperStyles); // Set default CSS for wrapper element
          imgWrapper.className = defaultPlaceholderClass; // Attach default CSS placeholder class to image wrapper

          // Append placeholder custom class if attribute is present
          if(placeholderClassAttr !== undefined && placeholderClassAttr !== '') {
            imgWrapper.className += ' '+placeholderClassAttr;
          }

          // Set default CSS width + unit for img element
          if(isResponsiveAttr) {
              // Set image element width in %
              setImageElementWidth = Math.round((imgElementWidth * 100) / parentElementWidth);
              setImageElementWidth+= '%';

              // Set wrapper width to width of image element
              imgWrapper.style.width = setImageElementWidth;
            }
            else {
              // Set image element width in px
              setImageElementWidth = Math.round(imgElementWidth);
              setImageElementWidth+= 'px';

              // Set wrapper width to width of image element
              imgWrapper.style.width = setImageElementWidth;
            }

          // Add image element styles to wrapper element
          for(var property in imgElementStyles) {
            imgWrapper.style[property] = imgElementStyles[property];
          }

          imgElement.style.width = '100%'; // Span image element to 100% width of wrapper
          imgElement.style.padding = imgElement.style.margin = 0; // Set image element's margin/padding to 0

          parentElement.replaceChild(imgWrapper, imgElement); // Replace actual image element with wrapper element
          imgWrapper.appendChild(imgElement); // Append actual image element to wrapper element
          // This will wrap the image element into a parent div tag used for showing the loader

          // Show loader if 'no-loader' attribute is not present
          if(!noLoaderAttr) {
            var imgWrapperWidth = imgWrapper.offsetWidth;

              // Show loader if wrapper width is more than 70px
              imgWrapperWidth >= 70 ? renderLoader() : isSmall = true;
            }

          // Create animation sequence if attribute is present
          if(animationDurationAttr !== undefined && animationDurationAttr !== '') {
            animationText = animationAttr+' '+animationDurationAttr+' '+easingAttr;
          }
        }

      // Function to get element's content width (without horizontal padding)
      function getElementContentWidth(element, type) {
          var styles = window.getComputedStyle(element), // Get computed styles of element
               padding = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight); // Get horizontal padding of element

          // Return content width
          if(type === 'wrapper') {
            return element.offsetWidth - padding;
          }
          else {
            return element.offsetWidth;
          }
        }

      // Function to create image wrapper element
      function generateImageWrapper() {
          imgElement = element[0], // Get image element
          parentElement = imgElement.parentNode; // Get parent of image element

          // Fire interval for checking image's width/height until calculated by DOM
          var interval = setInterval(function() {

              // If image element's width and height have been calculated by DOM then clear interval
              if(imgElement.offsetWidth !== 0 && imgElement.clientHeight !== 0) {
                clearInterval(interval);

                  // Get image element's visual styles and set it to wrapper element when rendered in DOM
                  var imgElementStyles = {
                    padding: window.getComputedStyle(imgElement).padding,
                    margin: window.getComputedStyle(imgElement).margin,
                    borderRadius: window.getComputedStyle(imgElement).borderRadius,
                    border: window.getComputedStyle(imgElement).border,
                    boxShadow: window.getComputedStyle(imgElement).boxShadow,
                    float: window.getComputedStyle(imgElement).float,
                    transform: window.getComputedStyle(imgElement).transform,
                    outline: window.getComputedStyle(imgElement).outline
                  };

                  // Set content width for parent, image elements
                  var parentElementWidth = getElementContentWidth(parentElement, 'wrapper'),
                  imgElementWidth = getElementContentWidth(element[0], 'image');

                  // Render image wrapper
                  renderImageWrapper(imgElementWidth, parentElementWidth, imgElementStyles);
                }
              }, 1);
        }

      // Function to load image into DOM
      function loadImage() {
          removeLoader(); // Remove loader element once image is loaded

          removeImgWrapper(); // Remove image wrapper from DOM

          // Make element appear with transition/animation
          $timeout(function() {
            element.css({
                  'transition': ' all '+ transitionDurationAttr +' '+ easingAttr, // Set element transition
                  'opacity': 1, // Show image element in view
                  'animation': animationAttr ? animationText : '' // Set element animation
                });
          }, 100); // Timeout to clear stack and rebuild DOM
        }

      // Function to initiate actual image load
      function onImageLoad() {
        loadImage();
        element.unbind('load');
      }

      // Function to initialise directive
      function initialize() {

          // Hide image element from view
          element.css({
            'opacity': 0
          });

          // Create image wrapper for loader
          generateImageWrapper();

          // Check if image element has already been completely downloaded
          if(element[0].complete && element[0].naturalWidth > 0) {
            loadImage();
          }
          else {
              // Else detect image load event
              element.bind('load', onImageLoad);
            }
          }

      // Function to get image element's source
      function getImageSrc() {
        return element[0].getAttribute('src');
      }

      // Attach a watcher to image element's source
      scope.$watch(getImageSrc, function(newSrcValue, oldSrcValue) {

          // Check if the image element's source has actually changed
          if(newSrcValue && newSrcValue !== oldSrcValue) {
              initialize(); // Re-initialise directive
            }

          });

      // Initialise directive
      initialize();
    }
  }
})
