///<reference path="..\..\types\angularjs\angular.d.ts"/>
angular.module("app", ['ngAnimate', 'sun-table', 'sun-pending']).config(function (SunTableParamsProvider, SunTableTemplates) {
    SunTableTemplates.prefix = "/";
    SunTableParamsProvider.defaultSettings.steps = 3;
}).controller("AppCtrl", function ($scope, $filter, $timeout, SunTableParams) {
    var data = [{ name: "Moroni", age: 50 }, { name: "Tiancum", age: 43 }, { name: "Jacob", age: 34 }, { name: "Nephi", age: 29 }, { name: "Enos", age: 34 }, { name: "Tiancum", age: 43 }, { name: "Jacob", age: 27 }, { name: "Nephi", age: 29 }, { name: "Enos", age: 34 }, { name: "Tiancum", age: 43 }, { name: "Jacob", age: 27 }, { name: "Nephi", age: 29 }, { name: "Enos", age: 34 }, { name: "Tiancum", age: 43 }, { name: "Jacob", age: 27 }, { name: "Nephi", age: 29 }, { name: "Enos", age: 34 }];
    $scope.name = 34;
    $timeout(function () {
        $scope.name = 213;
    }, 800);
    var deltas = [600, 600, 200, 200, 200, 800];
    $scope.sto = new SunTableParams(function () {
        var sto = this;
        return $timeout(function () {
            var filtered = $filter('filter')(data, sto.filter);
            var ordered = $filter('orderBy')(filtered, sto.orderBy());
            sto.total = ordered.length;
            return ordered.slice((sto.page - 1) * sto.count, (sto.page) * sto.count - 1);
        }, deltas.shift() || 600);
    });
}).directive('defaultTable', function ($compile, $templateRequest) {
    return {
        scope: { '$table': "=defaultTable" },
        compile: function (tElement) {
            var clone = tElement.children().detach();
            return function (scope, element) {
                $templateRequest('template.html').then(function (template) {
                    template = $(template);
                    template.find('table').prepend(clone);
                    element.after(template);
                    $compile(template)(scope);
                    element.remove();
                });
            };
        }
    };
});
//# sourceMappingURL=wraped.js.map