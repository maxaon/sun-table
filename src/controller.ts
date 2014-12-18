/// <reference path="./module.ts" />
/// <reference path="./helpers.ts" />
module sun.table {
  export class SunTableController {
    static $inject = ['$scope', '$timeout'];
    private $scope: ng.IScope;
    private $timeout: ng.ITimeoutService;

    constructor($scope, $timeout) {
      this.$scope = $scope;
      this.$timeout = $timeout
    }

    $table: SunTableParams;

    init(table) {
      this.$table = table;
      var $timeout = this.$timeout;
      var timerId = null,
          values = {},
          massUpdate = ()=> {
            this.setFilter(values);
          };


      this.requestFilterUpdate = function (k, v) {
        $timeout.cancel(timerId);
        values[k] = v;
        timerId = $timeout(massUpdate, this.$table.$settings.filterDelay)
      };
      this.requestForcedFilterUpdate = function (k, v) {
        $timeout.cancel(timerId);
        values[k] = v;
        massUpdate();
      }
    }

    sortBy(column, event) {
      var $table = this.$table;
      var defaultSort,
          steps = [defaultSort = $table.$settings.defaultSort, (defaultSort === 'asc' ? 'desc' : 'asc')];
      if ($table.$settings.steps == OrderSteps.AscDescReset) {
        steps.push(undefined)
      }
      var nextSortIndex = (steps.indexOf($table.sorting[column]) + 1) % steps.length,
          nextSort = steps[nextSortIndex];
      if (!event || !(event.ctrlKey || event.metaKey)) {
        $table.sorting = {};
      }
      if (nextSort)
        $table.sorting[column] = nextSort;
      else
        delete $table.sorting[column];
    }

    setFilter(key: string, value: any);
    setFilter(values: any);
    setFilter(values: any, v?: any) {
      if (angular.isString(values)) {
        var n = {};
        n[values] = v;
        values = n;
      }
      this.$table.filter = _(this.$table.filter)
        .extend(values)
        .reduce((acc, v, k)=> {
          if (v != undefined) {
            acc[k] = v;
          }
          return acc
        }, {});
    }

    requestForcedFilterUpdate(name: string, value: any) {
      throw new Error("Controller was not initialized")
    }

    requestFilterUpdate(name: string, value: any) {
      throw new Error("Controller was not initialized")
    }

  }

  angular.module('sun-table')
    .controller('SunTableController', SunTableController)
}