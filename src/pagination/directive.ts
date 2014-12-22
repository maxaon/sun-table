/// <reference path="../../types/lodash/lodash.d.ts" />
/// <reference path="../../types/jquery/jquery.d.ts" />
/// <reference path="../helpers.ts" />
/// <reference path="../params.ts" />
/// <reference path="../module.ts" />

module sun.table {
  SunTableModule
    .directive('sun-table-footer', function (SunTableTemplates) {
      return {
        templateUrl: SunTableTemplates.prefix + SunTableTemplates.pagination.footer,
        scope: {"$table": '=sunTableFooter'}
      }

    })
    .directive('sunPagination', function (SunTableTemplates) {
      return {
        templateUrl: SunTableTemplates.prefix + SunTableTemplates.pagination.pagination,
        scope: {
          '$table': '=sunPagination'
        }
      }
    });
  SunTableModule.directive('sunRowsPerPage', function (SunTableTemplates) {
    return {
      templateUrl: SunTableTemplates.prefix + SunTableTemplates.pagination.rowsPerPage,
      scope: {
        '$table': '=sunRowsPerPage'
      }
    }
  });
}