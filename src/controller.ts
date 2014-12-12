/// <reference path="./module.ts" />
/// <reference path="./helpers.ts" />
module sun.table {
    export class SunTableController {
        $loading:boolean = false;

        constructor() {


        }

        sortBy(column, event) {
            //var parsedSortable = $scope.parse(column.sortable);
            //if (!parsedSortable) {
            //    return;
            //}
            //var defaultSort = $scope.$params.settings().defaultSort;
            //var inverseSort = (defaultSort === 'asc' ? 'desc' : 'asc');
            //var sorting = $scope.$params.sorting() && $scope.$params.sorting()[parsedSortable] && ($scope.$params.sorting()[parsedSortable] === defaultSort);
            //var sortingParams = (event.ctrlKey || event.metaKey) ? $scope.$params.sorting() : {};
            //sortingParams[parsedSortable] = (sorting ? inverseSort : defaultSort);
            //$scope.$params.parameters({
            //    sorting: sortingParams
            //});
        }
    }

    angular.module('sun-table')
        .controller('SunTableController', SunTableController)
}