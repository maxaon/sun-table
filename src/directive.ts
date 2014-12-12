/// <reference path="../types/lodash/lodash.d.ts" />
/// <reference path="../types/jquery/jquery.d.ts" />
/// <reference path="./helpers.ts" />
/// <reference path="./params.ts" />
/// <reference path="./module.ts" />

module sun.table {
  export class CopyAttributes {
    sortable: string = "";
    ngShow: string = null;
    ngHide: string = null;
  }
  export class TableColumn {
    id: number;
    columnTitle: string = "";
    columnClass: string = null;
    copy: CopyAttributes = new CopyAttributes();
  }

  interface ITableScope extends ng.IScope {
    $loading:boolean;
    $table:SunTableParams;
    $columns:TableColumn[];
  }
  function tagOrAttr(element, key) {
    return element[0] && (element[0].tagName === key || element.attr(key)) ? element : null
  }

  function camelToDash(str) {
    return str.replace(/\W+/g, '-')
      .replace(/([a-z\d])([A-Z])/g, '$1-$2');
  }

  function get(element, attibute, defaultValue = undefined, shouldDelete = false): string {
    var val = defaultValue;
    if (!(element instanceof Node))
      element = element[0];
    if (element.hasAttribute(attibute)) {
      val = element.getAttribute(attibute);
      if (shouldDelete) {
        element.removeAttribute(attibute);
      }
    }
    return val;
  }

  function getAndDelete(element, attibute, defaultValue = undefined): string {
    return get(element, attibute, defaultValue, true);
  }

  SunTableModule.directive('sunTable', function ($compile: ng.ICompileService,
                                                 $q: ng.IQService,
                                                 $parse: ng.IParseService) {
      return {
        restrict: 'A',
        priority: 1001,
        scope: true,
        controller: 'SunTableController',
        controllerAs: 'ngTable',
        compile: function (element: ng.IAugmentedJQuery, attrs) {
          var table = tagOrAttr(element, 'table') || element.find('table');

          var columns: TableColumn[] = [], i = 0, row = null;

          // custom header
          var thead = element.children('thead');
          thead.detach();

          // IE 8 fix :not(.ng-table-group) selector
          angular.forEach(angular.element(element.find('tr')), function (tr) {
            tr = angular.element(tr);
            if (!tr.hasClass('ng-table-group') && !row) {
              row = tr;
            }
          });
          if (!row) {
            return;
          }
          angular.forEach(row.find('td'), function (item) {
            var el = angular.element(item);
            var column: TableColumn = new TableColumn();
            if (el.attr('ignore-cell') && 'true' === el.attr('ignore-cell')) {
              return;
            }


            column.id = i++;

            //column.filter = getAndDelete(item, 'sortable');
            column.columnTitle = getAndDelete(item, 'column-title');
            column.columnClass = getAndDelete(item, 'column-class');
            column.copy.ngShow = get(item, 'ng-show');
            column.copy.ngHide = get(item, 'ng-hide');
            column.copy.sortable = getAndDelete(item, 'sortable');

            columns.push(column);
          });
          return function (scope: ITableScope, element: ng.IAugmentedJQuery, attrs) {
            scope.$loading = false;
            scope.$columns = columns;

            scope.$watch(attrs.sunTable, (function (params) {
              if (angular.isUndefined(params)) {
                return;
              }
              //scope.paramsModel = $parse(attrs.ngTable);
              scope.$table = params;
            }));
            scope.$watch('$table.$params', function (val) {
              scope.$table.reload();
            }, true);

            ['$data', '$loading', '$pages'].forEach(function (param) {
              scope.$watch('$table.' + param, function (val) {
                scope[param] = val;
              })
            });

            var header = document.createElement('thead');
            if (true) {
              var titles = document.createElement('tr');
              var filters = document.createElement('tr');
              header.appendChild(titles);
              columns.forEach(function (column: TableColumn) {
                var td = document.createElement('td');
                td.textContent = column.columnTitle;
                angular.forEach(column.copy, function (value, key) {
                  if (value) {
                    key = camelToDash(key);
                    td.setAttribute(key, value)
                  }
                });
                titles.appendChild(td);
              });
            }
            element.prepend(header);
            $compile(header)(scope);

          }

        }
      }
    }
  )

}