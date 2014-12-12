/// <reference path="../types/lodash/lodash.d.ts" />
/// <reference path="../types/jquery/jquery.d.ts" />
/// <reference path="./helpers.ts" />
/// <reference path="./params.ts" />
/// <reference path="./module.ts" />

module sun.table {

  SunTableModule
    .directive('sun-table-footer',func)
    .directive('sunPagination', function () {
      return {
        templateUrl: 'partials/pagination.html',
        scope: {
          '$table': '=sunPagination'
        }
      }
    });
  SunTableModule.directive('sunRowsPerPage', function () {
    return {
      templateUrl: 'partials/rows-per-page.html',
      scope: {
        '$table': '=sunRowsPerPage'
      }
    }
  });
}