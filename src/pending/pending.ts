/// <reference path="../../types/lodash/lodash.d.ts" />
/// <reference path="../../types/jquery/jquery.d.ts" />
/// <reference path="../../types/angularjs/angular.d.ts" />
/// <reference path="../helpers.ts" />
module sun.pending {
  function parse(value: any): number {
    if (value == undefined) {
      return undefined
    }
    else if (!value) {
      return 0;
    }
    else {
      return parseInt(value);
    }
  }

  interface IPendignAttributes extends ng.IAttributes {
    pending:string; // If the expression is truthy then overlay element is shown
    debounce:number; // Time in ms before show overlay
    debounceOut:number; // Time to hide overlay after pending is truthy
    flickerFix:number; //If the last overlay display duration wass less then this time debounce will be disabled
  }
  angular.module('sun-pending', [])
    .constant("PendingOptions", {
      template: "pending/pending.html",
      image: null,
      text: null
    })
    .directive('pending', function ($animate, $http, $templateCache, PendingOptions, $compile, $timeout) {
      return {
        transclude: true,
        link: function (scope: ng.IScope,
                        element: JQuery,
                        attrs: IPendignAttributes,
                        ctrl,
                        transclude: ng.ITranscludeFunction) {

          var loading, overlap, hiddenClone,
              hideLoading = sun.helpers.attrToBoolean(attrs, 'hideLoading');
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

          $http.get(PendingOptions.template, {cache: $templateCache})
            .then(function (resp) {
              var template = $(resp.data);
              overlap = $compile(template)(scope);
              element.append(overlap);
              showHiddenTable();
            });

          var NG_HIDE_CLASS = 'ng-hide';
          var NG_HIDE_IN_PROGRESS_CLASS = 'ng-hide-animate';

          var toggle: Function = function toggle(value: boolean) {
            $animate[!value ? 'addClass' : 'removeClass'](overlap, NG_HIDE_CLASS, {
              tempClasses: NG_HIDE_IN_PROGRESS_CLASS
            });
          };

          var timer, requestTime,
              flickerFix = parse(attrs.flickerFix),
              debounce = parse(attrs.debounce),
              originalDebounce = debounce,
              debounceOut = parse(attrs.debounceOut);

          if (sun.helpers.attrToBoolean(attrs, 'debounce')) {
            toggle = _.wrap(toggle, function (toggle, loading) {
              if (!loading) {
                var delta = (+new Date) - requestTime - originalDebounce; // Time of displaying loading overlay whit debounce enabled
                console.log(delta);
                if (delta > 0 && delta < flickerFix) { // If overlay flicks
                  debounce = debounceOut = 0;
                }
                else if (delta < 0 && -delta < originalDebounce) { // if request time is less than original debounce
                  debounce = parse(attrs.debounce);
                  debounceOut = parse(attrs.debounceOut)
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
              requestTime = +(new Date)
            }

            showHiddenTable();

            overlap && toggle(loading);
          })
        }
      }
    });
}