/// <reference path="../types/lodash/lodash.d.ts" />
/// <reference path="../types/jquery/jquery.d.ts" />
/// <reference path="../types/angularjs/angular.d.ts" />
var sun;
(function (sun) {
    var table;
    (function (table) {
        table.SunTableModule = angular.module('sun-table', []);
    })(table = sun.table || (sun.table = {}));
})(sun || (sun = {}));

var sun;
(function (sun) {
    var helpers;
    (function (helpers) {
        var Event = (function () {
            function Event(name) {
                this.name = name;
                this.prevented = false;
            }
            Event.prototype.prevent = function () {
                this.prevented = true;
            };
            return Event;
        })();
        helpers.Event = Event;
        var Observable = (function () {
            function Observable() {
            }
            Observable.prototype.on = function (name, callback, context) {
                if (context === void 0) { context = this; }
                this.__listeners = this.__listeners || {};
                this.__listeners[name] = this.__listeners[name] || [];
                this.__listeners[name].push({ callback: callback, context: context });
                return this;
            };
            Observable.prototype.emit = function (name) {
                var options = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    options[_i - 1] = arguments[_i];
                }
                var event, listeners = (this.__listeners || {})[name] || [];
                if (options[0] instanceof Event) {
                    event = options[0];
                }
                else {
                    event = new Event(name);
                    options.unshift(event);
                }
                for (var i = 0; i < listeners.length; i++) {
                    listeners[i].callback.apply(listeners[i].context, options);
                    if (event.prevented) {
                        break;
                    }
                }
                return event;
            };
            return Observable;
        })();
        helpers.Observable = Observable;
        function attrToBoolean(attrs, name) {
            var value = attrs[name];
            if (value === 'false' || value === '0')
                return false;
            return attrs.hasOwnProperty(name);
        }
        helpers.attrToBoolean = attrToBoolean;
        function camelToDash(str) {
            return str.replace(/\W+/g, '-').replace(/([a-z\d])([A-Z])/g, '$1-$2');
        }
        helpers.camelToDash = camelToDash;
    })(helpers = sun.helpers || (sun.helpers = {}));
})(sun || (sun = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../types/lodash/lodash.d.ts" />
/// <reference path="./module.ts" />
/// <reference path="./helpers.ts" />
var sun;
(function (sun) {
    var table;
    (function (table) {
        var $q, $filter;
        function isNumber(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }
        var Params = (function () {
            function Params() {
                this.page = 1;
                this.sorting = {};
                this.filter = {};
            }
            return Params;
        })();
        table.Params = Params;
        (function (OrderSteps) {
            OrderSteps[OrderSteps["AscDesc"] = 2] = "AscDesc";
            OrderSteps[OrderSteps["AscDescReset"] = 3] = "AscDescReset";
        })(table.OrderSteps || (table.OrderSteps = {}));
        var OrderSteps = table.OrderSteps;
        var Settings = (function () {
            function Settings() {
                this.data = null; //allows data to be set when table is initialized
                this.total = 0;
                this.defaultSort = 'desc';
                this.filterDelay = 750;
                this.counts = [10, 25, 50, 100];
                this.steps = 2 /* AscDesc */;
            }
            return Settings;
        })();
        table.Settings = Settings;
        var SunTableParams = (function (_super) {
            __extends(SunTableParams, _super);
            function SunTableParams(settings, params) {
                _super.call(this);
                this.$params = new Params();
                this.$settings = new sun.table.Settings();
                this.$loading = false;
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
            SunTableParams.prototype.parameters = function (newParameters, parseParamsFromUrl) {
                if (parseParamsFromUrl === void 0) { parseParamsFromUrl = false; }
                if (angular.isDefined(newParameters)) {
                    for (var key in newParameters) {
                        if (!newParameters.hasOwnProperty(key)) {
                            continue;
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
                        }
                        else {
                            this.$params[key] = (isNumber(newParameters[key]) ? parseFloat(newParameters[key]) : angular.copy(newParameters[key]));
                        }
                    }
                    return this;
                }
                return this.$params;
            };
            // deprecated
            SunTableParams.prototype.settings = function (newSettings) {
                if (angular.isDefined(newSettings)) {
                    if (angular.isArray(newSettings.data)) {
                        //auto-set the total from passed in data
                        newSettings.total = newSettings.data.length;
                    }
                    this.$settings = angular.extend(this.$settings, newSettings);
                    return this;
                }
                return this.$settings;
            };
            Object.defineProperty(SunTableParams.prototype, "page", {
                get: function () {
                    return angular.isDefined(this.$params.page) ? this.$params.page : 1;
                },
                set: function (page) {
                    this.$params.page = page;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SunTableParams.prototype, "count", {
                get: function () {
                    return angular.isDefined(this.$params.count) ? this.$params.count : this.$settings.counts[0];
                },
                set: function (count) {
                    this.$params.count = count;
                    this.$params.page = 1;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SunTableParams.prototype, "filter", {
                get: function () {
                    return this.$params.filter;
                },
                set: function (value) {
                    this.$params.filter = value;
                    this.page = 1;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SunTableParams.prototype, "total", {
                get: function () {
                    return this.$settings.total;
                },
                set: function (value) {
                    this.$settings.total = value;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SunTableParams.prototype, "sorting", {
                get: function () {
                    return this.$params.sorting;
                },
                set: function (value) {
                    this.$params.sorting = value;
                },
                enumerable: true,
                configurable: true
            });
            SunTableParams.prototype.orderBy = function () {
                var order = [], sorting = this.$params.sorting;
                for (var column in sorting) {
                    if (sorting.hasOwnProperty(column) && sorting[column]) {
                        order.push((sorting[column] === "asc" ? "+" : "-") + column);
                    }
                }
                return order;
            };
            SunTableParams.prototype.getStaticData = function () {
                var filtered = $filter('filter')(this.$settings.data, this.filter);
                var ordered = $filter('orderBy')(filtered, this.orderBy());
                this.total = ordered.length;
                return ordered.slice((this.page - 1) * this.count, this.page * this.count);
            };
            SunTableParams.prototype.getData = function () {
                var result = [];
                if (this.$settings.populateData)
                    result = this.$settings.populateData.call(this, this.$params);
                else if (angular.isArray(this.$settings.data)) {
                    result = this.getStaticData();
                }
                return $q.when(result);
            };
            SunTableParams.prototype.getGroups = function () {
                throw new Error("Not implemented");
            };
            SunTableParams.prototype.generatePagesArray = function (currentPage, totalItems, pageSize) {
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
                        }
                        else {
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
            };
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
            SunTableParams.prototype.reload = function () {
                var _this = this;
                var data;
                this.$loading = true;
                if (this.$params.groupBy) {
                    data = this.getGroups();
                }
                else {
                    data = this.getData();
                }
                return $q.when(data).then(function (data) {
                    _this.$loading = false;
                    _this.$data = data;
                    _this.$pages = _this.generatePagesArray(_this.page, _this.total, _this.count);
                });
            };
            return SunTableParams;
        })(sun.helpers.Observable);
        table.SunTableParams = SunTableParams;
        table.SunTableModule.provider('SunTableParams', function () {
            var provider = this;
            this.defaultSettings = new Settings();
            this.$get = ['$q', '$filter', function (_$q_, _$filter_) {
                $q = _$q_;
                $filter = _$filter_;
                SunTableParams.defaultSettings = provider.defaultSettings;
                return SunTableParams;
            }];
            return this;
        });
    })(table = sun.table || (sun.table = {}));
})(sun || (sun = {}));

/// <reference path="./module.ts" />
/// <reference path="./helpers.ts" />
/// <reference path="./params.ts" />
var sun;
(function (sun) {
    var table;
    (function (_table) {
        var SunTableController = (function () {
            function SunTableController($scope, $timeout) {
                this.$scope = $scope;
                this.$timeout = $timeout;
            }
            SunTableController.prototype.init = function (table) {
                var _this = this;
                this.$table = table;
                var $timeout = this.$timeout;
                var timerId = null, values = {}, massUpdate = function () {
                    _this.setFilter(values);
                };
                this.requestFilterUpdate = function (k, v) {
                    $timeout.cancel(timerId);
                    values[k] = v;
                    timerId = $timeout(massUpdate, this.$table.$settings.filterDelay);
                };
                this.requestForcedFilterUpdate = function (k, v) {
                    $timeout.cancel(timerId);
                    values[k] = v;
                    massUpdate();
                };
            };
            SunTableController.prototype.sortBy = function (column, event) {
                var $table = this.$table;
                var defaultSort, steps = [defaultSort = $table.$settings.defaultSort, (defaultSort === 'asc' ? 'desc' : 'asc')];
                if ($table.$settings.steps == 3 /* AscDescReset */) {
                    steps.push(undefined);
                }
                var nextSortIndex = (steps.indexOf($table.sorting[column]) + 1) % steps.length, nextSort = steps[nextSortIndex];
                // If ctrl or meta was not pressed then reset sorting
                if (!event || !(event.ctrlKey || event.metaKey)) {
                    $table.sorting = {};
                }
                if (nextSort)
                    $table.sorting[column] = nextSort;
                else
                    delete $table.sorting[column];
            };
            SunTableController.prototype.setFilter = function (values, v) {
                if (angular.isString(values)) {
                    var n = {};
                    n[values] = v;
                    values = n;
                }
                this.$table.filter = _(this.$table.filter).extend(values).reduce(function (acc, v, k) {
                    if (v != undefined) {
                        acc[k] = v;
                    }
                    return acc;
                }, {});
            };
            SunTableController.prototype.requestForcedFilterUpdate = function (name, value) {
                throw new Error("Controller was not initialized");
            };
            SunTableController.prototype.requestFilterUpdate = function (name, value) {
                throw new Error("Controller was not initialized");
            };
            SunTableController.$inject = ['$scope', '$timeout'];
            return SunTableController;
        })();
        _table.SunTableController = SunTableController;
        angular.module('sun-table').controller('SunTableController', SunTableController);
    })(table = sun.table || (sun.table = {}));
})(sun || (sun = {}));

/// <reference path="./helpers.ts" />
/// <reference path="./params.ts" />
/// <reference path="./module.ts" />
/// <reference path="./controller.ts" />
var sun;
(function (sun) {
    var table;
    (function (_table) {
        var CopyAttributes = (function () {
            function CopyAttributes() {
                this.sortable = "";
                this.ngShow = null;
                this.ngHide = null;
            }
            return CopyAttributes;
        })();
        _table.CopyAttributes = CopyAttributes;
        var TableColumn = (function () {
            function TableColumn() {
                this.copy = new CopyAttributes();
            }
            return TableColumn;
        })();
        _table.TableColumn = TableColumn;
        function copyAttributes(to, attrs) {
            for (var key in attrs) {
                if (attrs.hasOwnProperty(key) && attrs[key] !== undefined) {
                    to.attr(key, attrs[key]);
                }
            }
        }
        function get(element, attibute, defaultValue, shouldDelete) {
            if (defaultValue === void 0) { defaultValue = undefined; }
            if (shouldDelete === void 0) { shouldDelete = false; }
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
        function getAndDelete(element, attibute, defaultValue) {
            if (defaultValue === void 0) { defaultValue = undefined; }
            return get(element, attibute, defaultValue, true);
        }
        _table.SunTableModule.directive('sunTable', ["$compile", function ($compile) {
            return {
                restrict: 'A',
                priority: 1001,
                scope: true,
                controller: 'SunTableController',
                controllerAs: 'ngTable',
                require: 'sunTable',
                compile: function (element) {
                    var table = element[0].tagName.toLowerCase() === 'table' ? element : element.find('table'), columns = [], i = 0;
                    // custom header
                    var thead = table.children('thead');
                    thead.detach();
                    angular.forEach(thead.find('[sun-head-cell]'), function (item) {
                        var el = angular.element(item);
                        el.detach();
                        var column = new TableColumn();
                        column.id = i++;
                        column.template = $(item);
                        column.filter = getAndDelete(item, 'filter');
                        column.filterData = getAndDelete(item, 'filter-data');
                        column.copy.ngShow = get(item, 'ng-show');
                        column.copy.ngHide = get(item, 'ng-hide');
                        columns.push(column);
                    });
                    return function (scope, element, attrs, ctrl) {
                        scope.$loading = false;
                        scope.$columns = columns;
                        scope.$watch(attrs.sunTable, (function (table) {
                            if (angular.isUndefined(table)) {
                                return;
                            }
                            ctrl.init(table);
                            scope.$table = table;
                        }));
                        scope.$watch('$table.$params', function () {
                            scope.$table.reload();
                        }, true);
                        var header;
                        if (thead.attr('partial') === 'false') {
                            header = thead;
                        }
                        else {
                            header = document.createElement('thead');
                            var titles = document.createElement('tr'), filters = document.createElement('tr'), hasFilter = false;
                            columns.forEach(function (column) {
                                var template = column.template.appendTo(titles);
                                var th = $(document.createElement('th')).appendTo(filters);
                                var filterContent = template.children('filter').detach();
                                if (column.filter || filterContent.length > 0) {
                                    hasFilter = true;
                                    copyAttributes(th, {
                                        'sun-head-filter': template.attr('sun-head-cell'),
                                        'filter': column.filter,
                                        'filter-data': column.filterData
                                    });
                                    if (filterContent.length > 0) {
                                        _.each(filterContent[0].attributes, function (attr) {
                                            th.attr(attr.name, attr.value);
                                        });
                                        th.append(filterContent.children());
                                    }
                                }
                            });
                            header.appendChild(titles);
                            if (hasFilter) {
                                header.appendChild(filters);
                            }
                        }
                        element.prepend(header);
                        $compile(header)(scope);
                    };
                }
            };
        }]);
        _table.SunTableModule.directive('sunHeadCell', function () {
            return {
                require: '^sunTable',
                transclude: true,
                link: function (scope, element, attrs, ctrl, transclude) {
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
                                element.addClass('sort-' + val);
                        });
                        element.on('click', function (event) {
                            scope.$apply(function () {
                                ctrl.sortBy(sortKey, event);
                            });
                        });
                    }
                }
            };
        });
    })(table = sun.table || (sun.table = {}));
})(sun || (sun = {}));

/// <reference path="./module.ts" />
var sun;
(function (sun) {
    var table;
    (function (table) {
        table.SunTableModule.constant('SunTableTemplates', {
            prefix: '',
            pagination: {
                footer: 'pagination/partials/footer.html',
                pagination: 'pagination/partials/pagination.html',
                rowsPerPage: 'pagination/partials/rows-per-page.html'
            },
            filter: {
                select: 'filter/partials/select.html',
                text: 'filter/partials/text.html'
            }
        });
    })(table = sun.table || (sun.table = {}));
})(sun || (sun = {}));

/// <reference path="../helpers.ts" />
/// <reference path="../module.ts" />
/// <reference path="../params.ts" />
/// <reference path="../controller.ts" />
var sun;
(function (sun) {
    var table;
    (function (table) {
        var SunFilterController = (function () {
            function SunFilterController($scope, $attrs, $q) {
                this.$scope = $scope;
                this.$attrs = $attrs;
                this.$q = $q;
            }
            SunFilterController.prototype.init = function (tableCtrl) {
                var _this = this;
                this.tableCtrl = tableCtrl;
                this.name = this.$attrs['name'] || this.$attrs['sunHeadFilter'];
                this.value = tableCtrl.$table.filter[this.name];
                this.$scope.$watch('filter.value', function (value, old) {
                    if (value === old) {
                        return;
                    }
                    _this.update();
                });
                this.$scope.$watch(this.$attrs['filterData'], function (value) {
                    if (value)
                        _this.$q.when(value).then(function (result) {
                            _this.filterData = result;
                        });
                    else
                        _this.filterData = null;
                });
            };
            SunFilterController.prototype.update = function (force) {
                if (force || this.instant) {
                    this.tableCtrl.requestForcedFilterUpdate(this.name, this.value);
                }
                else {
                    this.tableCtrl.requestFilterUpdate(this.name, this.value);
                }
            };
            SunFilterController.prototype.clear = function () {
                this.value = undefined;
            };
            SunFilterController.$inject = ['$scope', '$attrs', '$q'];
            return SunFilterController;
        })();
        table.SunFilterController = SunFilterController;
        table.SunTableModule.controller('SunFilterController', SunFilterController);
        table.SunTableModule.controller('SunFilterSelectController', ["$scope", function ($scope) {
            $scope.template = 'k as v for (k,v) in filter.filterData';
        }]);
    })(table = sun.table || (sun.table = {}));
})(sun || (sun = {}));

/// <reference path="../module.ts" />
/// <reference path="../helpers.ts" />
/// <reference path="../params.ts" />
/// <reference path="./controller.ts" />
var sun;
(function (sun) {
    var table;
    (function (table) {
        table.SunTableModule.directive('sunHeadFilter', ["$compile", "$timeout", "SunTableTemplates", function ($compile, $timeout, SunTableTemplates) {
            return {
                require: ['^sunTable', 'sunHeadFilter'],
                controller: table.SunFilterController,
                controllerAs: 'filter',
                scope: true,
                transclude: true,
                link: function (scope, element, attrs, ctrls, transclude) {
                    var tableCtrl = ctrls[0], filterCtrl = ctrls[1];
                    var type = attrs.filter;
                    if (type) {
                        scope.template = SunTableTemplates.prefix + SunTableTemplates.filter[type];
                        element.append("<div ng-include=\"template\"></div>");
                        $compile(element.contents())(scope);
                    }
                    else {
                        transclude(scope, function (clone) {
                            element.append(clone);
                        });
                    }
                    $timeout(function () { return filterCtrl.init(tableCtrl); });
                    element.on('keypress', function (event) {
                        if (event.keyCode === 13) {
                            scope.$apply(function () { return filterCtrl.update(true); });
                        }
                    });
                }
            };
        }]);
        table.SunTableModule.directive('instantFilter', function () {
            return {
                require: '^sunHeadFilter',
                link: function (scope, element, attrs, ctrl) {
                    ctrl.instant = sun.helpers.attrToBoolean(attrs, 'instantFilter');
                }
            };
        });
    })(table = sun.table || (sun.table = {}));
})(sun || (sun = {}));

/// <reference path="../../types/lodash/lodash.d.ts" />
/// <reference path="../../types/jquery/jquery.d.ts" />
/// <reference path="../helpers.ts" />
/// <reference path="../module.ts" />
/// <reference path="../params.ts" />
var sun;
(function (sun) {
    var table;
    (function (table) {
        table.SunTableModule.directive('sun-table-footer', ["SunTableTemplates", function (SunTableTemplates) {
            return {
                templateUrl: SunTableTemplates.prefix + SunTableTemplates.pagination.footer,
                scope: { "$table": '=sunTableFooter' }
            };
        }]).directive('sunPagination', ["SunTableTemplates", function (SunTableTemplates) {
            return {
                templateUrl: SunTableTemplates.prefix + SunTableTemplates.pagination.pagination,
                scope: {
                    '$table': '=sunPagination'
                }
            };
        }]);
        table.SunTableModule.directive('sunRowsPerPage', ["SunTableTemplates", function (SunTableTemplates) {
            return {
                templateUrl: SunTableTemplates.prefix + SunTableTemplates.pagination.rowsPerPage,
                scope: {
                    '$table': '=sunRowsPerPage'
                }
            };
        }]);
    })(table = sun.table || (sun.table = {}));
})(sun || (sun = {}));

/// <reference path="../../types/lodash/lodash.d.ts" />
/// <reference path="../../types/jquery/jquery.d.ts" />
/// <reference path="../../types/angularjs/angular.d.ts" />
/// <reference path="../helpers.ts" />
var sun;
(function (sun) {
    var pending;
    (function (pending) {
        function parse(value) {
            if (value == undefined) {
                return undefined;
            }
            else if (!value) {
                return 0;
            }
            else {
                return parseInt(value);
            }
        }
        angular.module('sun-pending', []).constant("PendingOptions", {
            template: "pending/pending.html",
            image: null,
            text: null
        }).directive('pending', ["$animate", "$http", "$templateCache", "PendingOptions", "$compile", "$timeout", function ($animate, $http, $templateCache, PendingOptions, $compile, $timeout) {
            return {
                transclude: true,
                link: function (scope, element, attrs, ctrl, transclude) {
                    var loading, overlap, hiddenClone, hideLoading = sun.helpers.attrToBoolean(attrs, 'hideLoading');
                    attrs.$addClass('pending-wrapper');
                    transclude(scope, function (clone) {
                        if (hideLoading) {
                            clone.hide();
                            hiddenClone = clone;
                        }
                        element.append(clone);
                    });
                    var showHiddenTable = function () {
                        if (hiddenClone && !loading && overlap) {
                            hiddenClone.show();
                            hiddenClone = null;
                            showHiddenTable = angular.noop;
                        }
                    };
                    $http.get(PendingOptions.template, { cache: $templateCache }).then(function (resp) {
                        var template = $(resp.data);
                        overlap = $compile(template)(scope);
                        element.append(overlap);
                        showHiddenTable();
                        toggle(loading);
                    });
                    var NG_HIDE_CLASS = 'ng-hide';
                    var NG_HIDE_IN_PROGRESS_CLASS = 'ng-hide-animate';
                    var toggle = function toggle(value) {
                        $animate[!value ? 'addClass' : 'removeClass'](overlap, NG_HIDE_CLASS, {
                            tempClasses: NG_HIDE_IN_PROGRESS_CLASS
                        });
                    };
                    var timer, requestTime, flickerFix = parse(attrs.flickerFix), debounce = parse(attrs.debounce), originalDebounce = debounce, debounceOut = parse(attrs.debounceOut);
                    if (sun.helpers.attrToBoolean(attrs, 'debounce')) {
                        toggle = _.wrap(toggle, function (toggle, loading) {
                            if (!loading) {
                                var delta = (+new Date) - requestTime - originalDebounce; // Time of displaying loading overlay whit debounce enabled
                                console.log(delta);
                                if (delta > 0 && delta < flickerFix) {
                                    debounce = debounceOut = 0;
                                }
                                else if (delta < 0 && -delta < originalDebounce) {
                                    debounce = parse(attrs.debounce);
                                    debounceOut = parse(attrs.debounceOut);
                                }
                            }
                            $timeout.cancel(timer);
                            timer = $timeout(function () {
                                toggle(loading);
                            }, loading ? debounce : debounceOut || 0);
                        });
                    }
                    scope.$watch(attrs.pending, function (value) {
                        loading = value;
                        if (loading) {
                            requestTime = +(new Date);
                        }
                        showHiddenTable();
                        overlap && toggle(loading);
                    });
                }
            };
        }]);
    })(pending = sun.pending || (sun.pending = {}));
})(sun || (sun = {}));

angular.module("sun-table").run(["$templateCache", function($templateCache) {$templateCache.put("pending/pending.html","<div class=\"pending-overlap\">\r\n    <div class=\"center-wrap\">\r\n        <div class=\"centered\">\r\n            <span>Loading...</span>\r\n        </div>\r\n    </div>\r\n</div>");
$templateCache.put("filter/partials/select.html","<select class=\"input-filter form-control\"\r\n        ng-controller=\"SunFilterSelectController\"\r\n        instant-filter=\"\"\r\n        ng-model=\"filter.value\"\r\n        ng-options=\"{{template}}\" id=\"\">\r\n    <option value=\"\">\r\n        &mdash;&mdash;&mdash;&mdash;&mdash;\r\n    </option>\r\n</select>\r\n\r\n");
$templateCache.put("filter/partials/text.html","<input type=\"text\" ng-model=\"filter.value\"\r\n       class=\"input-filter form-control\"/>");
$templateCache.put("pagination/partials/footer.html","<div sun-pagination=\"$table\" class=\"pull-right\"></div>\r\n<div sun-rows-per-page=\"$table\"></div>");
$templateCache.put("pagination/partials/pagination.html","<ul class=\"pagination sun-table-pagination\">\r\n    <li ng-class=\"{\'disabled\': !page.active}\" ng-repeat=\"page in $table.$pages\" ng-switch=\"page.type\">\r\n        <a ng-switch-when=\"prev\" ng-click=\"$table.page = page.number\" href=\"\">&laquo;</a>\r\n        <a ng-switch-when=\"first\" ng-click=\"$table.page = page.number\" href=\"\"><span\r\n                ng-bind=\"page.number\"></span></a>\r\n        <a ng-switch-when=\"page\" ng-click=\"$table.page = page.number\" href=\"\"><span ng-bind=\"page.number\"></span></a>\r\n        <a ng-switch-when=\"more\" ng-click=\"$table.page = page.number\" href=\"\">&#8230;</a>\r\n        <a ng-switch-when=\"last\" ng-click=\"$table.page = page.number\" href=\"\"><span ng-bind=\"page.number\"></span></a>\r\n        <a ng-switch-when=\"next\" ng-click=\"$table.page = page.number\" href=\"\">&raquo;</a>\r\n    </li>\r\n</ul>");
$templateCache.put("pagination/partials/rows-per-page.html","<ul ng-if=\"$table.$settings.counts.length\" class=\"pagination\">\r\n    <li ng-repeat=\"count in $table.$settings.counts\"\r\n        ng-class=\"{\'active\':$table.count == count}\"\r\n        ng-click=\"$table.count=count\" >\r\n        <a href=\"\" ng-bind=\"count\"></a>\r\n    </li>\r\n</ul>");}]);