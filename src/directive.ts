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
    template: JQuery;
    filter: string;
    filterData: any;
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

  function copyAttributes(to: JQuery, attrs) {
    for (var key in attrs) {
      if (attrs.hasOwnProperty(key) && attrs[key] !== undefined) {
        to.attr(key, attrs[key]);
      }
    }

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
        require: 'sunTable',
        compile: function (element: ng.IAugmentedJQuery) {
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
          angular.forEach(thead.find('[sun-head-cell]'), function (item) {
            var el = angular.element(item);
            el.detach();
            var column: TableColumn = new TableColumn();

            column.id = i++;
            column.template = $(item);
            column.filter = getAndDelete(item, 'filter');
            column.filterData = getAndDelete(item, 'filter-data');
            column.copy.ngShow = get(item, 'ng-show');
            column.copy.ngHide = get(item, 'ng-hide');
            //column.copy.sortable = getAndDelete(item, 'sortable');

            columns.push(column);
          });
          return function (scope: ITableScope, element: ng.IAugmentedJQuery, attrs, ctrl: SunTableController) {
            scope.$loading = false;
            scope.$columns = columns;

            scope.$watch(attrs.sunTable, (function (params) {
              if (angular.isUndefined(params)) {
                return;
              }
              ctrl.init(params);
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

            var header;
            if (thead.attr('partial') === 'false') {
              header = thead;
            }
            else {
              header = document.createElement('thead');
              var titles = document.createElement('tr');
              var filters = document.createElement('tr');

              columns.forEach(function (column: TableColumn) {
                var template = column.template.appendTo(titles);
                var th = $(document.createElement('th')).appendTo(filters);

                var filterContent = template.children('filter').detach();
                if (column.filter || filterContent.length > 0) {
                  copyAttributes(th, {
                    'sun-head-filter': template.attr('sun-head-cell'),
                    'filter': column.filter,
                    'filter-data': column.filterData
                  });
                  if (filterContent.length > 0) {
                    _.each(filterContent[0].attributes, function (attr) {
                      th.attr(attr.name, attr.value)
                    });
                    th.append(filterContent.children());
                  }
                }
              });
              header.appendChild(titles);
              header.appendChild(filters);
            }
            element.prepend(header);
            $compile(header)(scope);
          };

        }
      }
    }
  );
  SunTableModule.directive('sunHeadCell', function () {
    return {
      require: '^sunTable',
      //templateUrl: 'partials/header-cell.html',
      transclude: true,
      link: function (scope: ng.IScope, element: ng.IAugmentedJQuery, attrs, ctrl: SunTableController, transclude) {
        transclude(scope, function (clone) {
          var div = angular.element(document.createElement('div'));
          element.append(div.append(clone));
        });
        var sortKey = attrs.sortable || attrs.name || attrs.sunHeadCell;

        if (attrs.hasOwnProperty('sortable')) {
          element.addClass('sortable');
          scope.$watch('$table.sorting.' + sortKey, function (val) {
            element.removeClass('sort-asc sort-desc');
            if (val)
              element.addClass('sort-' + val)
          });
          element.on('click', function (event) {
            scope.$apply(function () {
              ctrl.sortBy(sortKey, event)
            });
          })
        }
      }
    }
  });


}