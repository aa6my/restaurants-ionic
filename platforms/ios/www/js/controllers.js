angular.module('controllers', [])

.controller('ListCtrl', function($scope, $http, $ionicPlatform, $cordovaGeolocation, restaurantService) {
  
  $scope.restaurants;

  //attach service function to scope
  $scope.setSelected = restaurantService.setSelected;

  //refresh restaurant list whenever we enter this view
  $scope.$on('$ionicView.beforeEnter', function () {
    $scope.refreshLocation();        
  });
  
  $scope.refreshLocation = function () {
    var posOptions = {timeout: 10000, maximumAge: 30000, enableHighAccuracy: false};
    
    $ionicPlatform.ready(function() {
      $cordovaGeolocation
        .getCurrentPosition(posOptions)
        .then(function (position) {
          userLat  = position.coords.latitude
          userLong = position.coords.longitude
          $scope.getRestaurants(userLat, userLong);
        }, function(err) {
          // error
        });
    });    
  }


  //function needs to be attached to scope for pull to refresh
  $scope.getRestaurants = function (userLat, userLong) {    
    
    $http.get('http://api.usergrid.com/alexm/sandbox/restaurants?ql=location within 16093 of ' + userLat + ',' + userLong)
      .success(function(data, status, headers, config) {
        
        $scope.restaurants = data.entities;
        $scope.$broadcast('scroll.refreshComplete');        
      });
  }
})

.controller('DetailsCtrl', function($scope, $http, restaurantService) {

  $scope.restaurant;
  $scope.reviews;
  $scope.stars;
  $scope.map;
  $scope.restID;
  $scope.userLocation;
  $scope.markerOptions;
  $scope.restID;

  $scope.$on('$ionicView.beforeEnter', function () {
    $scope.restaurant = restaurantService.getSelected();
    $scope.restID = $scope.restaurant.restID;  
    $scope.userLocation = {
      latitude: $scope.restaurant.location.latitude,
      longitude: $scope.restaurant.location.longitude
    }

    $scope.map = { center: $scope.userLocation, zoom: 15 };
    $scope.markerOptions = {
      animation: google.maps.Animation.DROP
    }

    getReviews($scope.restID);
  });

  var getReviews = function (restID) {
    $http.get('http://api.usergrid.com/alexm/sandbox/reviews?ql=restID=' + restID)
      .success(function(data, status, headers, config) {
        $scope.reviews = data.entities;
      }); 
  }

  $scope.getRating = function (ratingIndex) {
    var rating = parseInt($scope.reviews[ratingIndex].rating);
    return new Array(rating)
  }

  $scope.showGoogleMap = function (lat, lng) {
    var latlng = new google.maps.LatLng(lat,lng);   
    var options = { zoom: 11, center: latlng, disableDefaultUI: false, mapTypeId: google.maps.MapTypeId.ROADMAP, draggable: true };
    var map = new google.maps.Map(document.getElementById('googlemapsjs1'), options);
    return map;
  }
});