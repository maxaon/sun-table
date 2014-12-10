/// <reference path="./helpers.ts" />
/// <reference path="./module.ts" />
module sun.table {
    var $q:ng.IQService;

    function isNumber(n:any):boolean {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    export interface ITableScope extends ng.IScope {
        $data:any[];
        $groups:any[];
        pages:any[];
    }
    export interface Params {
        page:number;
        count:number;
        filter:any;
        sorting:any;
        total:number;
        group: any;
        groupBy: any;
    }

    export interface Settings {
        $scope: ITableScope; // set by ngTable controller
        $loading: boolean;
        data: any[]; //allows data to be set when table is initialized
        total: number;
        defaultSort: string;
        filterDelay: number;
        counts: number[]
        populateGroups: Function;
        populateData: Function;
    }

    export class SunTableParams extends sun.helpers.Observable {
        static defaultSettings:Settings;
        private params:Params;
        private _settings:Settings;
        data:any[];


        constructor(params, settings) {
            super();
            this.data = [];
            this.parameters(params);
            this.settings(settings);
            this.settings = settings;
        }

        parameters(newParameters, parseParamsFromUrl = false):any {
            if (angular.isDefined(newParameters)) {
                for (var key in newParameters) {
                    var value = newParameters[key];
                    if (parseParamsFromUrl && key.indexOf('[') >= 0) {
                        var keys = key.split(/\[(.*)\]/).reverse()
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
                            this.params[lastKey] = {};
                        }
                        this.params[lastKey] = angular.extend(this.params[lastKey] || {}, value[lastKey]);
                    } else {
                        this.params[key] = (isNumber(newParameters[key]) ? parseFloat(newParameters[key]) : newParameters[key]);
                    }
                }
                return this;
            }
            return this.params;
        }

        settings(newSettings):any {
            if (angular.isDefined(newSettings)) {
                if (angular.isArray(newSettings.data)) {
                    //auto-set the total from passed in data
                    newSettings.total = newSettings.data.length;
                }
                this._settings = angular.extend(this._settings, newSettings);
                return this;
            }
            return this._settings;
        }

        get page() {
            return this.params.page;
        }

        set page(page:number) {
            this.params.page = page;
        }

        get count() {
            return this.params.count
        }

        set count(count:number) {
            this.params.count = count;
            this.params.page = 1;
        }

        get filter() {
            return this.params.filter;
        }

        set filter(value:any) {
            this.params.filter = value;
        }

        get total() {
            return this.params.total;
        }

        set total(value:any) {
            this.params.total = value;
        }

        get sorting() {
            return this.params.sorting;
        }

        set sorting(value:any) {
            this.params.sorting = value;
        }

        isSortBy(field, direction) {
            return angular.isDefined(this.params.sorting[field]) && this.params.sorting[field] == direction;
        }

        orderBy() {
            var sorting = [];
            for (var column in this.params.sorting) {
                sorting.push((this.params.sorting[column] === "asc" ? "+" : "-") + column);
            }
            return sorting;
        }

        getData():ng.IPromise<any> {
            if (this._settings.populateData)
                return $q.when(this._settings.populateData(this.params, this));
            if (angular.isArray(this.data)) {
                return $q.when(this.data.slice((this.page - 1) * this.count, this.page * this.count));
            } else {
                return $q.when([]);
            }
        }

        getGroups():ng.IPromise<any> {
            throw new Error("Not implemented");
            //var column = this.params.groupBy;
            //var data;
            //if (this._settings.populateGroups)
            //    data = $q.when(this._settings.populateGroups(this.params.groupBy));
            //
            //defer.promise.then(function (data) {
            //    var groups = {};
            //    angular.forEach(data, function (item) {
            //        var groupName = angular.isFunction(column) ? column(item) : item[column];
            //
            //        groups[groupName] = groups[groupName] || {
            //            data: []
            //        };
            //        groups[groupName]['value'] = groupName;
            //        groups[groupName].data.push(item);
            //    });
            //    var result = [];
            //    for (var i in groups) {
            //        result.push(groups[i]);
            //    }
            //    $defer.resolve(result);
            //});
            //this.getData(defer, self);
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

        url(asString) {
            asString = asString || false;
            var pairs:any = (asString ? [] : {});
            for (var key in this.params) {
                if (this.params.hasOwnProperty(key)) {
                    var item = this.params[key],
                        name = encodeURIComponent(key);
                    if (typeof item === "object") {
                        for (var subkey in item) {
                            if (!angular.isUndefined(item[subkey]) && item[subkey] !== "") {
                                var pname = name + "[" + encodeURIComponent(subkey) + "]";
                                if (asString) {
                                    pairs.push(pname + "=" + item[subkey]);
                                } else {
                                    pairs[pname] = item[subkey];
                                }
                            }
                        }
                    } else if (!angular.isFunction(item) && !angular.isUndefined(item) && item !== "") {
                        if (asString) {
                            pairs.push(name + "=" + encodeURIComponent(item));
                        } else {
                            pairs[name] = encodeURIComponent(item);
                        }
                    }
                }
            }
            return pairs;
        }

        reload() {
            var data;

            this._settings.$loading = true;
            if (this.params.groupBy) {
                data = this.getGroups();
            } else {
                data = this.getData();
            }
            $q.when(data).then((data) => {
                this._settings.$loading = false;
                if (this.params.groupBy) {
                    //this.data =
                    this._settings.$scope.$groups = data;
                } else {
                    //this.data =
                    this._settings.$scope.$data = data;
                }
                this._settings.$scope.pages = this.generatePagesArray(this.page, this.total, this.count);
                this._settings.$scope.$emit('ngTableAfterReloadData');
            });
        }

    }


    SunTableModule.provider('SunTableParams', function () {
            var provider = this;
            this.defaultSettings = {
                $scope: null, // set by ngTable controller
                $loading: false,
                data: null, //allows data to be set when table is initialized
                total: 0,
                defaultSort: 'desc',
                filterDelay: 750,
                counts: [10, 25, 50, 100]
            };
            this.$get = function (_$q_) {
                $q = _$q_;
                SunTableParams.defaultSettings = provider.defaultSettings;
                return SunTableParams;
            };
            return this;
        }
    );
}