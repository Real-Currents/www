/* Maponics Design
 * Copyright © Maponics 2016
 * Created by John Hall <jhall@maponics.com>, <john@real-currents.com>
 * Base layout for Maponics web GUI's
 */
'use strict';

mxApp.directive('mxTabChart', [ 
    '$document',
    function ($document) {
        return {
            compile: function (elm, attrs, trans) {
                return function (scope, element, attrs) {
                    var table = elm[0],
                        title = scope.title,
                        fields = [];
                    
                    if (Array.isArray(scope.data))
                        scope.data.forEach(function (v, a, i) {
                            for (var field in v) {
                                if (field === "$$hashKey") return field;
                                if (fields.indexOf(field) < 0) fields.push(field);
                            }
                            return field;
                        }); 
                    
                    scope.fields = fields;
                    
                    scope.getFieldWidth = function () {
                        return (100/fields.length) +"%";
                    };
                };
            },
            restrict: 'E',
            scope: {
                data: '=',
                title: '='
            },
            transclude: true,
            template: '\
<table class="table table-hover dataTable" role="grid" aria-describedby="{{title}}"> \
    <thead> \
        <tr role="row"> \
            <th ng-repeat="field in fields" class="sorting_desc" tabindex="0" rowspan="1" colspan="1" aria-label="{{field}}: activate to sort column ascending" aria-sort="descending"  width="{{getFieldWidth();}}"> {{field}} \
            </th> \
        </tr> \
    </thead> \
    <tbody> \
        <tr role="row" ng-repeat="row in data" ng-class="($index%2)? \'even\': \'odd\'"> \
            <td ng-repeat="field in fields" ng-class="sort-{{field}}" width="{{getFieldWidth();}}">{{row[field]}}</td> \
        </tr> \
    </tbody> \
</table> \
'
        }
    }
]);
