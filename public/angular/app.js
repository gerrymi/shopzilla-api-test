var app = angular.module("shopZilla", ["infinite-scroll", "ngAnimate", "ui.router", "angular-click-outside", "angular-flexslider"]);
app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('brands', {
      url: "/:cats",
      templateUrl: '/shopzilla-api-test/public/angular/views/brands.html',
      controller: 'galleryCtrl'
    })
    .state('brands.all', {
      url: "/",
      templateUrl: '/shopzilla-api-test/public/angular/views/all.html',
      controller: 'galleryCtrl'
    })
    .state('brands.products', {
      url: "/:products",
      templateUrl: '/shopzilla-api-test/public/angular/views/products.html',
      controller: 'galleryCtrl'
    })
  $urlRouterProvider.otherwise("/");
});
app.config(function($httpProvider){
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
});
app.controller('galleryCtrl', function($window, $scope, $rootScope, $stateParams, $http, $location, $anchorScroll, shopZilla) {
	$window.document.title = "shopZilla: " + $stateParams.cats
	$scope.shopZilla = new shopZilla();
  $rootScope.cats = $stateParams.cats;
  $rootScope.products = $stateParams.products;
  $scope.go = function() {
   $location.path( $stateParams.cats+"/" );
  };
  $scope.scrollOff = function(){ 
  		$rootScope.scroll = "modal-no-scroll";
  }; 
  $scope.scrollOn = function(){ 
  		$rootScope.scroll = "modal-scroll"
  };
  $http.get("http://catalog.bizrate.com/services/catalog/v1/us/product?apiKey=f1131affb74662c8a9d73bfa68b4216d&publisherId=610065&placementId=&categoryId=&keyword="+$stateParams.cats+"&productId=&productIdType=&offersOnly=&merchantId=&brandId="+$stateParams.products+"&biddedOnly=&minPrice=&maxPrice=&minMarkdown=&zipCode=&freeShipping=&start=0&results=10000&backfillResults=0&startOffers=0&resultsOffers=0&sort=relevancy_desc&attFilter=&attWeights=&attributeId=&resultsAttribute=&resultsAttributeValues=&showAttributes=&showProductAttributes=&minRelevancyScore=100&maxAge=&showRawUrl=&imageOnly=&reviews=none&retailOnly=&format=json&callback=callback").then(function(res){
    $scope.products = res.data.products.product;
  });
  $http.get("http://catalog.bizrate.com/services/catalog/v1/us/product?apiKey=f1131affb74662c8a9d73bfa68b4216d&publisherId=610065&placementId=&categoryId=&keyword="+$stateParams.cats+"&productId=&productIdType=&offersOnly=&merchantId=&brandId=&biddedOnly=&minPrice=&maxPrice=&minMarkdown=&zipCode=&freeShipping=&start=0&results=10000&backfillResults=0&startOffers=0&resultsOffers=0&sort=relevancy_desc&attFilter=&attWeights=&attributeId=&resultsAttribute=&resultsAttributeValues=&showAttributes=&showProductAttributes=&minRelevancyScore=100&maxAge=&showRawUrl=&imageOnly=&reviews=none&retailOnly=&format=json&callback=callback").then(function(res){
    var negativeFilters = ["men", "mens", "men's", "boy's", "kid", "kids", "kid's", "child", "child's", "childs", "children", "childrens", "children's", "nike"]
    var unfiltered = res.data.products.product
    console.log ("hello", unfiltered)
    var filtered = unfiltered.filter(function(product) {
      var words = JSON.stringify(product).split(' ')
      var final = false
      for (j=0; j<negativeFilters.length; j++) {
        for (i=0; i<words.length; i++) {
          if (negativeFilters[j] == words[i]) {
            final = false
            console.log ('false', negativeFilters[i])
          } else {
            final = true
            console.log ('true')
          }
        }  
      }
      return final
    })
    console.log("hello", filtered)
    $scope.productsAll = filtered
  });
})
app.factory('shopZilla', function($http, $stateParams) {
	var shopZilla = function() {
		this.brands = [];
		this.busy = false;
	};
	var loaded = 0
  shopZilla.prototype.nextPage = function() {
		if (this.busy) return;
		this.busy = true;
		  $http.get("http://catalog.bizrate.com/services/catalog/v1/us/brands?apiKey=f1131affb74662c8a9d73bfa68b4216d&publisherId=610065&start="+loaded+"&results=20&keyword="+$stateParams.cats+"&format=json&callback=callback").then(function(res){
        brands = res.data.brands.brand;
        for (i=0; i<brands.length; i++) {
          this.brands.push(brands[i]);
        }
        loaded += 20;
        this.busy = false;
      }.bind(this));
	};
    return shopZilla;
});