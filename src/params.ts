/// <reference path="../types/lodash/lodash.d.ts" />
/// <reference path="./helpers.ts" />
/// <reference path="./module.ts" />
module sun.table {
  var $q: ng.IQService, $filter: ng.IFilterService;

  function isNumber(n: any): boolean {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  export class Params {
    page: number = 1;
    sorting: any = {};
    filter: {[key:string]:string} = {};
    count: number;
    group: any;
    groupBy: any;
  }

  export enum OrderSteps {AscDesc = 2, AscDescReset = 3}

  export class Settings {
    data: any[] = null; //allows data to be set when table is initialized
    total: number = 0;
    defaultSort: string = 'desc';
    filterDelay: number = 750;
    counts: number[] = [10, 25, 50, 100];
    steps: OrderSteps = OrderSteps.AscDesc;
    populateGroups: Function;
    populateData: Function;
  }

  export interface Page {
    type:string;
    number:number;
    active:boolean;
  }

  export class SunTableParams extends sun.helpers.Observable {
    static defaultSettings: Settings;
    $params: Params = new Params();
    $settings: Settings = new sun.table.Settings();

    $loading: boolean = false;
    $data: any[];
    $pages: Page[];

    constructor(settings: Settings, params: Params);
    constructor(populateData: Function, params: Params);
    constructor(settings: any, params: Params) {
      super();
      if (angular.isFunction(settings)) {
        settings = {
          populateData: settings
        };
      }

      this.settings(SunTableParams.defaultSettings);
      this.settings(settings);

      this.parameters(params);
    }

    //deprecated
    parameters(newParameters, parseParamsFromUrl = false): any {
      if (angular.isDefined(newParameters)) {
        for (var key in newParameters) {
          if (!newParameters.hasOwnProperty(key)) {
            continue
          }
          var value = newParameters[key];
          if (parseParamsFromUrl && key.indexOf('[') >= 0) {
            var keys = key.split(/\[(.*)\]/).reverse();
            var lastKey = '';
            for (var i = 0, len = keys.length; i < len; i++) {
              var name = keys[i];
              if (name !== '') {
                var v = value;
                value = {};
                value[lastKey = name] = (isNumber(v) ? parseFloat(v) : v);
              }
            }
            if (lastKey === 'sorting') {
              this.$params[lastKey] = {};
            }
            this.$params[lastKey] = angular.extend(this.$params[lastKey] || {}, value[lastKey]);
          } else {
            this.$params[key] = (isNumber(newParameters[key]) ? parseFloat(newParameters[key]) :
              angular.copy(newParameters[key]));
          }
        }
        return this;
      }
      return this.$params;
    }

    // deprecated
    settings(newSettings): any {
      if (angular.isDefined(newSettings)) {
        if (angular.isArray(newSettings.data)) {
          //auto-set the total from passed in data
          newSettings.total = newSettings.data.length;
        }
        this.$settings = angular.extend(this.$settings, newSettings);
        return this;
      }
      return this.$settings;
    }

    get page() {
      return angular.isDefined(this.$params.page) ? this.$params.page : 1;
    }

    set page(page: number) {
      this.$params.page = page;
    }

    get count() {
      return angular.isDefined(this.$params.count) ? this.$params.count : this.$settings.counts[0];
    }

    set count(count: number) {
      this.$params.count = count;
      this.$params.page = 1;
    }

    get filter() {
      return this.$params.filter;
    }

    set filter(value: any) {
      this.$params.filter = value;
      this.page = 1;
    }

    get total() {
      return this.$settings.total;
    }

    set total(value: any) {
      this.$settings.total = value;
    }

    get sorting() {
      return this.$params.sorting;
    }

    set sorting(value: any) {
      this.$params.sorting = value;
    }

    orderBy() {
      var order = [],
          sorting = this.$params.sorting;

      for (var column in sorting) {
        if (sorting.hasOwnProperty(column) && sorting[column]) {
          order.push((sorting[column] === "asc" ? "+" : "-") + column);
        }
      }
      return order;
    }

    getStaticData(): any[] {
      var filtered = $filter('filter')(this.$settings.data, this.filter);
      var ordered = $filter('orderBy')(filtered, this.orderBy());
      this.total = ordered.length;
      return ordered.slice((this.page - 1) * this.count, this.page * this.count);
    }

    getData(): ng.IPromise<any> {
      var result = [];
      if (this.$settings.populateData)
        result = this.$settings.populateData.call(this, this.$params);
      else if (angular.isArray(this.$settings.data)) {
        result = this.getStaticData();
      }
      return $q.when(result);
    }

    getGroups(): ng.IPromise<any> {
      throw new Error("Not implemented");
    }

    generatePagesArray(currentPage, totalItems, pageSize) {
      var maxBlocks, maxPage, maxPivotPages, minPage, numPages, pages;
      maxBlocks = 11;
      pages = [];
      numPages = Math.ceil(totalItems / pageSize);
      if (numPages > 1) {
        pages.push({
          type: 'prev',
          number: Math.max(1, currentPage - 1),
          active: currentPage > 1
        });
        pages.push({
          type: 'first',
          number: 1,
          active: currentPage > 1
        });
        maxPivotPages = Math.round((maxBlocks - 5) / 2);
        minPage = Math.max(2, currentPage - maxPivotPages);
        maxPage = Math.min(numPages - 1, currentPage + maxPivotPages * 2 - (currentPage - minPage));
        minPage = Math.max(2, minPage - (maxPivotPages * 2 - (maxPage - minPage)));
        var i = minPage;
        while (i <= maxPage) {
          if ((i === minPage && i !== 2) || (i === maxPage && i !== numPages - 1)) {
            pages.push({
              type: 'more',
              active: false
            });
          } else {
            pages.push({
              type: 'page',
              number: i,
              active: currentPage !== i
            });
          }
          i++;
        }
        pages.push({
          type: 'last',
          number: numPages,
          active: currentPage !== numPages
        });
        pages.push({
          type: 'next',
          number: Math.min(numPages, currentPage + 1),
          active: currentPage < numPages
        });
      }
      return pages;
    }

    //url(asString) {
    //  asString = asString || false;
    //  var pairs: any = (asString ? [] : {});
    //  for (var key in this.$params) {
    //    if (this.$params.hasOwnProperty(key)) {
    //      var item = this.$params[key],
    //          name = encodeURIComponent(key);
    //      if (typeof item === "object") {
    //        for (var subkey in item) {
    //          if (!angular.isUndefined(item[subkey]) && item[subkey] !== "") {
    //            var pname = name + "[" + encodeURIComponent(subkey) + "]";
    //            if (asString) {
    //              pairs.push(pname + "=" + item[subkey]);
    //            } else {
    //              pairs[pname] = item[subkey];
    //            }
    //          }
    //        }
    //      } else if (!angular.isFunction(item) && !angular.isUndefined(item) && item !== "") {
    //        if (asString) {
    //          pairs.push(name + "=" + encodeURIComponent(item));
    //        } else {
    //          pairs[name] = encodeURIComponent(item);
    //        }
    //      }
    //    }
    //  }
    //  return pairs;
    //}

    reload() {
      var data;

      this.$loading = true;
      if (this.$params.groupBy) {
        data = this.getGroups();
      } else {
        data = this.getData();
      }
      return $q.when(data).then((data) => {
        this.$loading = false;
        this.$data = data;
        this.$pages = this.generatePagesArray(this.page, this.total, this.count);
      });
    }
  }

  SunTableModule.provider('SunTableParams', function () {
      var provider = this;
      this.defaultSettings = new Settings();

      this.$get = function (_$q_, _$filter_) {
        $q = _$q_;
        $filter = _$filter_;
        SunTableParams.defaultSettings = provider.defaultSettings;
        return SunTableParams;
      };
      return this;
    }
  );
}