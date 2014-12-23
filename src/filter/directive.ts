/// <reference path="../module.ts" />
/// <reference path="../helpers.ts" />
/// <reference path="../params.ts" />
/// <reference path="./controller.ts" />

module sun.table {
  SunTableModule.directive('sunHeadFilter', function ($compile, $timeout, SunTableTemplates) {
    return {
      require: ['^sunTable', 'sunHeadFilter'],
      controller: SunFilterController,
      controllerAs: 'filter',
      scope: true,
      transclude: true,
      link: function (scope, element: ng.IAugmentedJQuery, attrs, ctrls, transclude: ng.ITranscludeFunction) {
        var tableCtrl: SunTableController = ctrls[0],
            filterCtrl: SunFilterController = ctrls[1];

        var type = attrs.filter;
        if (type) {
          scope.template = SunTableTemplates.prefix + SunTableTemplates.filter[type];
          element.append("<div ng-include=\"template\"></div>");
          $compile(element.contents())(scope);
        }
        else {
          transclude(scope, (clone)=> {
            element.append(clone);
          })
        }
        $timeout(()=> filterCtrl.init(tableCtrl));

        element.on('keypress', function (event) {
          if (event.keyCode === 13) {
            scope.$apply(()=>filterCtrl.update(true));
          }
        })
      }
    };
  });
  SunTableModule.directive('instantFilter', function () {
    return {
      require: '^sunHeadFilter',
      link: function (scope, element, attrs, ctrl) {
        ctrl.instant = sun.helpers.attrToBoolean(attrs, 'instantFilter');
      }
    };
  });

}
