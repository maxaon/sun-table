/// <reference path="../types/jquery/jquJery.d.ts" />
/// <reference path="./helpers.ts" />
/// <reference path="./module.ts" />

/**
 * ngTable: Table + Angular JS
 *
 * @author Vitalii Savchuk <esvit666@gmail.com>
 * @url https://github.com/esvit/ng-table/
 * @license New BSD License <http://creativecommons.org/licenses/BSD/>
 */
module sun.table {
  export class CopyAttributes {
    title :any;
    headerClass :any;
    headerClass :any;
  }
  export class TableColumns {
    id :number;
    copy :CopyAttributes;
    sortable :string;
  }
  function tagOrAttr(element, key) {
    return element[0] && (element[0].tagName === key || element.attr(key)) ? element : null
  }

  function get(element, attibute, defaultValue, shouldDelete) {
    var val = defaultValue;
    if (!element instanceof Node)
      element = element[0]
    if (element.hasAttribute(attibute)) {
      val = element.getAttribute(attibute);
      element.removeAttribute(attibute);
    }
    return val;
  }

  function getAndDelele(element, attibute, defaultValue) {
    get(element, attibute, defaultValue, true)
  }

  SunTableModule.directive('sunTable', function ($compile :ng.ICompileService,
                                                 $q :ng.IQService,
                                                 $parse :ng.IParseService) {

      return {
        restrict: 'A',
        priority: 1001,
        scope: true,
        controller: 'SunTableController',
        controllerAs: 'ngTable',
        compile: function (element :ng.IAugmentedJQuery, attrs) {
          debugger
          var table = tagOrAttr(element, 'table') || element.find('table');

          var columns = [], i = 0, row = null;

          // custom header
          var thead = element.children('thead');

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
            var column :TableColumns = new TableColumns();
            if (el.attr('ignore-cell') && 'true' === el.attr('ignore-cell')) {
              return;
            }

            //var parsedTitle = parsedAttribute('title', ' '),
            //  headerTemplateURL = parsedAttribute('header', false),
            //  filter = parsedAttribute('filter', false)(),
            //  filterTemplateURL = false,
            //  filterName = false;

            //if (filter && filter.$$name) {
            //  filterName = filter.$$name;
            //  delete filter.$$name;
            //}
            //if (filter && filter.templateURL) {
            //  filterTemplateURL = filter.templateURL;
            //  delete filter.templateURL;
            //}

            //el.attr('data-title-text', parsedTitle()); // this used in responsive table

            column.id = i++;
            column.sortable = getAndDelele(item, 'sortable');
            column.filter = getAndDelele(item, 'sortable');
            column.copy.title = getAndDelele(item, 'column-title');
            column.copy.headerClass = getAndDelele(item, 'column-class');
            column.copy.show = get(item, 'ng-show');
            column.copy.hide = get(item, 'ng-hide');

            columns.push(column);
          });
          return function (scope, element, attrs) {
            scope.$loading = false;
            scope.$columns = columns;

            scope.$watch(attrs.sunTable, (function (params) {
              if (angular.isUndefined(params)) {
                return;
              }
              //scope.paramsModel = $parse(attrs.ngTable);
              scope.params = params;
            }), true);
            //scope.parse = function (text) {
            //  return angular.isDefined(text) ? text(scope) : '';
            //};
            if (attrs.showFilter) {
              scope.$parent.$watch(attrs.showFilter, function (value) {
                scope.show_filter = value;
              });
            }
            angular.forEach(columns, function (column) {
              var def;
              if (!column.filterData) {
                return;
              }
              def = $parse(column.filterData)(scope, {
                $column: column
              });
              if (!(angular.isObject(def) && angular.isObject(def.promise))) {
                throw new Error('Function ' + column.filterData + ' must be instance of $q.defer()');
              }
              delete column.filterData;
              return def.promise.then(function (data) {
                if (!angular.isArray(data)) {
                  data = [];
                }
                data.unshift({
                  title: '-',
                  id: ''
                });
                column.data = data;
              });
            });
            if (!element.hasClass('ng-table')) {
              scope.templates = {
                header: (attrs.templateHeader ? attrs.templateHeader : 'ng-table/header.html'),
                pagination: (attrs.templatePagination ? attrs.templatePagination : 'ng-table/pager.html')
              };
              var headerTemplate = thead.length > 0 ? thead : angular.element(document.createElement('thead')).attr('ng-include', 'templates.header');
              var paginationTemplate = angular.element(document.createElement('div')).attr({
                'ng-table-pagination': 'params',
                'template-url': 'templates.pagination'
              });

              element.find('thead').remove();

              element.addClass('ng-table')
                .prepend(headerTemplate)
                .after(paginationTemplate);

              $compile(headerTemplate)(scope);
              $compile(paginationTemplate)(scope);
            }
          };
        }
      }
    }
  );
}