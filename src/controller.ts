/// <reference path="./module.ts" />
/// <reference path="./helpers.ts" />
module sun.table {
    export class SunTableController {
        $loading:boolean = false;

        constructor() {

        }

        sortBy(column, event) {
            var parsedSortable = $scope.parse(column.sortable);
            if (!parsedSortable) {
                return;
            }
            var defaultSort = $scope.params.settings().defaultSort;
            var inverseSort = (defaultSort === 'asc' ? 'desc' : 'asc');
            var sorting = $scope.params.sorting() && $scope.params.sorting()[parsedSortable] && ($scope.params.sorting()[parsedSortable] === defaultSort);
            var sortingParams = (event.ctrlKey || event.metaKey) ? $scope.params.sorting() : {};
            sortingParams[parsedSortable] = (sorting ? inverseSort : defaultSort);
            $scope.params.parameters({
                sorting: sortingParams
            });
        }
    }
    //var ngTableController = function ($scope, ngTableParams, $timeout) {
    //    $scope.$loading = false;
    //
    //    if (!$scope.params) {
    //        $scope.params = new ngTableParams();
    //    }
    //    $scope.params.settings().$scope = $scope;
    //
    //    var delayFilter = (function () {
    //        var timer = 0;
    //        return function (callback, ms) {
    //            $timeout.cancel(timer);
    //            timer = $timeout(callback, ms);
    //        };
    //    })();
    //
    //    $scope.$watch('params.$params', function (newParams, oldParams) {
    //        $scope.params.settings().$scope = $scope;
    //
    //        if (!angular.equals(newParams.filter, oldParams.filter)) {
    //            delayFilter(function () {
    //                $scope.params.$params.page = 1;
    //                $scope.params.reload();
    //            }, $scope.params.settings().filterDelay);
    //        } else {
    //            $scope.params.reload();
    //        }
    //    }, true);
    //
    //};

    angular.module('sun-table')
        .controller('SunTableController', SunTableController)
}