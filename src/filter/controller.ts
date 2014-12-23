/// <reference path="../helpers.ts" />
/// <reference path="../module.ts" />
/// <reference path="../params.ts" />
/// <reference path="../controller.ts" />
module sun.table {
  export class SunFilterController {
    static $inject = ['$scope', '$attrs', '$q'];
    private $scope;
    private $attrs: ng.IAttributes;
    private $q: ng.IQService;
    value: any;
    filterData: any;
    tableCtrl: SunTableController;
    name: string;
    instant: boolean;

    constructor($scope, $attrs, $q) {
      this.$scope = $scope;
      this.$attrs = $attrs;
      this.$q = $q;
    }

    init(tableCtrl: SunTableController) {
      this.tableCtrl = tableCtrl;
      this.name = this.$attrs['name'] || this.$attrs['sunHeadFilter'];
      this.value = tableCtrl.$table.filter[this.name];
      this.$scope.$watch('filter.value', (value, old)=> {
        if (value === old) {
          return
        }
        this.update();
      });
      this.$scope.$watch(this.$attrs['filterData'], (value)=> {
        if (value)
          this.$q.when(value).then((result)=> {
            this.filterData = result;
          });
        else
          this.filterData = null;
      });
    }

    update(force?: boolean) {
      if (force || this.instant) {
        this.tableCtrl.requestForcedFilterUpdate(this.name, this.value);
      }
      else {
        this.tableCtrl.requestFilterUpdate(this.name, this.value);
      }
    }

    clear() {
      this.value = undefined;
    }


  }

  SunTableModule.controller('SunFilterController', SunFilterController);


  SunTableModule.controller('SunFilterSelectController', function ($scope) {
    $scope.template = 'k as v for (k,v) in filter.filterData'
  });
}
