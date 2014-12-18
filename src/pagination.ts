/// <reference path="../types/lodash/lodash.d.ts" />
/// <reference path="../types/jquery/jquery.d.ts" />
/// <reference path="./helpers.ts" />
/// <reference path="./params.ts" />
/// <reference path="./module.ts" />

module sun.table {

  SunTableModule
    .directive('sun-table-footer', function () {
      return {
        template: '<div sun-pagination="sto" class="pull-right"></div><div sun-rows-per-page="sto"></div>',
        scope: {"$table": '=sunTableFooter'}
      }

    })
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