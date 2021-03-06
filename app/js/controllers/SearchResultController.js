/*jslint loopfunc: true */
angular.module('juiceShop').controller('SearchResultController', [
    '$scope',
    '$sce',
    '$window',
    '$uibModal',
    '$location',
    'ProductService',
    'BasketService',
    function ($scope, $sce, $window, $uibModal, $location, productService, basketService) {
        'use strict';

        $scope.showDetail = function (id) {

            $uibModal.open({
                templateUrl: 'views/ProductDetail.html',
                controller: 'ProductDetailsController',
                size: 'lg',
                resolve: {
                    id: function () {
                        return id;
                    }
                }
            });
        };

        $scope.addToBasket = function(id) {

            basketService.find($window.sessionStorage.bid).success(function (basket) {
                var productsInBasket = basket.data.products;
                var found = false;
                for (var i = 0; i < productsInBasket.length; i++) {
                    if (productsInBasket[i].id === id) {
                        found = true;
                        basketService.get(productsInBasket[i].basketItem.id).success(function (existingBasketItem) {
                            var newQuantity = existingBasketItem.data.quantity + 1;
                            basketService.put(existingBasketItem.data.id, {quantity: newQuantity}).success(function (updatedBasketItem) {
                                productService.get(updatedBasketItem.data.ProductId).success(function(product) {
                                    $scope.confirmation = 'Added another ' + product.data.name  + ' to basket.';
                                }).error(function(err) {
                                    console.log(err);
                                });
                            }).error(function(err) {
                                console.log(err);
                            });
                        }).error(function(err) {
                            console.log(err);
                        });
                        break;
                    }
                }
                if (!found) {
                    basketService.save({ProductId: id, BasketId: $window.sessionStorage.bid, quantity: 1}).success(function (newBasketItem) {
                        productService.get(newBasketItem.data.ProductId).success(function(product) {
                            $scope.confirmation = 'Placed ' + product.data.name  + ' into basket.';
                        }).error(function(err) {
                            console.log(err);
                        });
                    }).error(function(err) {
                        console.log(err);
                    });
                }
            }).error(function(err) {
                console.log(err);
            });
        };

        $scope.searchQuery = $sce.trustAsHtml($location.search().q);

        productService.search($scope.searchQuery).success(function (products) {
            $scope.products = products.data;
            for (var i=0; i<$scope.products.length; i++) {
                $scope.products[i].description = $sce.trustAsHtml($scope.products[i].description);
            }
        }).error(function(err) {
            console.log(err);
        });

    }]);