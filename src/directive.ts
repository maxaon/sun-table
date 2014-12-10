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
    function tagOrAttr(element, key) {
        return element[0] && (element[0].tagName === key || element.attr(key)) ? element : null
    }

    SunTableModule.directive('sunTable', function ($compile:ng.ICompileService,
                                                   $q:ng.IQService,
                                                   $parse:ng.IParseService) {

            return {
                restrict: 'A',
                priority: 1001,
                scope: true,
                controller: 'SunTableController',
                controllerAs: 'ngTable',
                compile: function (element:ng.IAugmentedJQuery,attrs) {
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
                        if (el.attr('ignore-cell') && 'true' === el.attr('ignore-cell')) {
                            return;
                        }
                        var parsedAttribute = function (attr:string, defaultValue:any) {
                            return function (scope = null) {
                                return $parse(el.attr('x-data-' + attr) || el.attr('data-' + attr) || el.attr(attr))(scope, {
                                        $columns: columns
                                    }) || defaultValue;
                            };
                        };

                        var parsedTitle = parsedAttribute('title', ' '),
                            headerTemplateURL = parsedAttribute('header', false),
                            filter = parsedAttribute('filter', false)(),
                            filterTemplateURL = false,
                            filterName = false;

                        if (filter && filter.$$name) {
                            filterName = filter.$$name;
                            delete filter.$$name;
                        }
                        if (filter && filter.templateURL) {
                            filterTemplateURL = filter.templateURL;
                            delete filter.templateURL;
                        }

                        el.attr('data-title-text', parsedTitle()); // this used in responsive table
                        columns.push({
                            id: i++,
                            title: parsedTitle,
                            sortable: parsedAttribute('sortable', false),
                            'class': el.attr('x-data-header-class') || el.attr('data-header-class') || el.attr('header-class'),
                            filter: filter,
                            filterTemplateURL: filterTemplateURL,
                            filterName: filterName,
                            headerTemplateURL: headerTemplateURL,
                            filterData: (el.attr("filter-data") ? el.attr("filter-data") : null),
                            show: (el.attr("ng-show") ? function (scope) {
                                return $parse(el.attr("ng-show"))(scope);
                            } : function () {
                                return true;
                            })
                        });
                    });
                    return function (scope, element, attrs) {
                        scope.$loading = false;
                        scope.$columns = columns;

                        scope.$watch(attrs.ngTable, (function (params) {
                            if (angular.isUndefined(params)) {
                                return;
                            }
                            scope.paramsModel = $parse(attrs.ngTable);
                            scope.params = params;
                        }), true);
                        scope.parse = function (text) {
                            return angular.isDefined(text) ? text(scope) : '';
                        };
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