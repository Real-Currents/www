/* Maponics Design
 * Copyright © Maponics 2016
 * Created by John Hall <jhall@maponics.com>, <john@real-currents.com>
 * Base layout for Maponics web GUI's
 */
'use strict';

var mxApp = angular.module('mx', ['mxDesign']);

mxApp.config([
    'mxContentProvider',
    function (mxContentProvider) {
        /* Update the global var defined in mx-content.json */
        window.mxContent.subfeatures = window.mxSubs;

        /* Pass content from the global var defined in mx-content.json */
        mxContentProvider.loadMXContent(window.mxContent);
    }
]);

mxApp.controller('AppController', [
    '$scope',
    '$compile',
    '$document',
    '$mdDialog',
    'mxContent',
    'mdModalDefaults',
    function ($scope, $compile, $document, $mdDialog, content, mdModal) {
        var data = (function (d) {for (var i=0; i<30; i++) d.push(0); return d; })([]) // 300 data points
            .map(function () {
                var start = new Date('2015-01-01'),
                    end = new Date('2015-12-31');

                return {
                    x: new Date(start.getTime() + Math.random()*(end.getTime() - start.getTime())),
                    y: Math.random()*500,
                    r: Math.random()*10
                };
            });

        $scope.content = content;

        $scope.data = data;

        content.show = {
            "main-menu": true
        };

        content.handler.subscribe(
            'mainMenu',
            function (event, envelope) {
                if (event.sub) {
                     content.show[event.sub +'-menu'] = false;
                 }
                content.show['main-menu'] = true;
            }
        );

        content.handler.subscribe(
            "openMenu",
            function (event, envelope) {
                var menu_bg = angular.element($document[0].querySelectorAll('md-backdrop.md-opaque.md-mxTheme-theme')),
                    menu_bg_dims = menu_bg[0].getBoundingClientRect(),
                    scope = $scope;

                if (menu_bg[0].innerHTML.match(/div/) === null) {
                    //menu_bg[0].style.backgroundColor = "transparent";
                    menu_bg[0].innerHTML = '\
                        <div style="float:left;width:25%;height:100%;min-width:360px;min-height:320px;">&nbsp;</div>\
                    ';
                }
            }
        );

        content.handler.subscribe(
            "closeMenu",
            function (event, envelope) {
                for (var m in content.show) {
                    content.show[m] = false;
                }
                content.show['main-menu'] = true;
            }
        );

        if (typeof content.features == 'object') for (var f=0; f < content.features.length; f++) {
            for (var o in content.features[f].options) {
                var action = content.features[f].options[o].action;

                if (content.features[f].options[o].sub) {
                    var sub = content.features[f].options[o].sub;

                    content.handler.subscribe(
                        action,
                        function (event, envelope) {
                            /* Show the submenu for this item */
                            content.show['main-menu'] = false;
                            content.show[event.sub +'-menu'] = true;
                            if (event.activeSubs && event.activeSubs.length) {
                                event.active = true;
                            } else {
                                event.active = false
                            }

                            if (event.apply) event.apply();
                        }
                    );

                } else if (action === "mxSub3.option") {
                    var sub3option = content.features[f].options[o];

                    /* onClose will be called when mdModal dialog is closed */
                    mdModal.onClose = function (event, envelope) {
                        sub3option.active = false;
                        content.handler.default("mxSub3.option", sub3option);
                    };

                    /* onCollapse will be called when mdModal dialog is collapsed */
                    mdModal.onCollapse = function (event, envelope) {
                        alert('Modal is collapsing.');
                    };

                    content.handler.subscribe(
                        action,
                        function (event, envelope) {
                            if (event.active) {
                                content.showModal(event);

                                /* Calling this event with an empty event
                                 * object will close the navigation menu
                                 */
                                content.handler.default("closeMenu", {});

                            } else content.hideModal(event);
                        }
                    );

                } else {
                    content.handler.subscribe(
                        action,
                        function (event, envelope) {
                            if (event.active) alert( event.name +" is on" );
                            else alert( event.name +" is off" );
                        }
                    );
                }
            }
        }

        content.showModal = function (event) {
            $mdDialog.show({
              controller: function ($scope) {
                $scope.data = data;
              },
              clickOutsideToClose: false,
              fullscreen: false,
              parent: angular.element($document.body),
              targetEvent: event,
              template:  '\
<md-draggable-modal id="ResultsWindow" \
                    dialog-title="Data Results" \
                    group="draggable" \
                    on-close="onClose" \
                    options="{addClasses: false, cancel: \'.panel-body\', opacity: 0.35}" \
                    show="true" >\
    <md-list>\
      <ul class="list-group">\
        <li class="list-group-item" ng-repeat="d in data">{{ d }}</li>\
      </ul>\
    </md-list>\
</md-draggable-modal>\
'
            })
            .then(function (answer) {
              $scope.status = 'You said the information was "' + answer + '".';
            }, function() {
              $scope.status = 'You cancelled the dialog.';
            });
        };

        content.hideModal = function (event) {
            $mdDialog.hide();
        };

        if (typeof content.subfeatures == 'object') for (var p in content.subfeatures) {
            // Subscribe to Basemaps and Context submenu buttons
            var sup = content.subfeatures[p].super;
            for (var sf in content.subfeatures[p].features) {
                for (var so in content.subfeatures[p].features[sf].options) {
                    var suboption = content.subfeatures[p].features[sf].options[so],
                        subaction = content.subfeatures[p].features[sf].options[so].action;

                    suboption.super = sup;
                    suboption.plural = !!content.subfeatures[p].features[sf].plural;

                    content.handler.subscribe(
                        subaction,
                        function (event, envelope) {

                            // If this sub option is active, also activate super option
                            for (var f=0; f < content.features.length; f++) {
                                for (var o in content.features[f].options) {

                                    if (content.features[f].options[o].action == event.super) {
                                        content.features[f].options[o].activeSubs = content.features[f].options[o].activeSubs || [];

                                        if (event.active) {
                                            if (!event.plural)
                                                content.features[f].options[o].activeSubs.pop();
                                            content.features[f].options[o].activeSubs.push(event);
                                        } else {
                                            content.features[f].options[o].activeSubs.pop();
                                        }
                                        if (content.features[f].options[o].activeSubs.length)
                                            content.features[f].options[o].active = true;
                                        else content.features[f].options[o].active = false;
                                    }
                                }
                            }

                            var type;

                            switch (event.action.substr(-7)) {
                                case 'option1':
                                    type = 'mxD3BarPlotTime'; //'mxD3CatBar';
                                    break;
                                case 'option2':
                                    type = 'mxD3ScatterPlotTime';
                                    break;
                                case 'option3':
                                    type = 'mxD3LinePlotTime';
                                    break;
                                default:
                                    type = 'mxD3ScatterPlotTime';
                            }

                            // Multiple D3 Charts for MX SubFeature 1
                            if (event.super == "mxSub2.option1" ) {
                                var menu_bg = angular.element($document[0].querySelectorAll('md-backdrop.md-sidenav-backdrop')),
                                    menu_bg_dims = menu_bg[0].getBoundingClientRect(),
                                    d3div = angular.element(
                                        Array.prototype.filter.call(menu_bg.find('div'), function (x) {
                                            return (x.id === (event.action +'-chart'));
                                        })[0]),
                                    scope = $scope;

                                 if (d3div.length < 1) {
                                    menu_bg.append('\
                                        <div id="'+ event.action +'-chart" class="d3"></div> \
                                    ');

                                    d3div = angular.element(
                                        Array.prototype.filter.call(menu_bg.find('div'), function (x) {
                                            return (x.id === (event.action +'-chart'));
                                        })[0])
                                        .append('\
                                            <mx-d3-chart class="d3" \
                                                         data="data" \
                                                         width="360" \
                                                         height="320" \
                                                         type="\''+ type +'\'">\
                                            </mx-d3-chart>\
                                        ');
                                    $compile(d3div.contents())(scope);
                                } else if (!event.active) {
                                    d3div.remove();
                                }
                            }

                            // Single D3/Tabular Chart for MX SubFeature 2
                            if (event.super == "mxSub2.option2") {
                                var menu_bg = angular.element($document[0].querySelectorAll('md-backdrop.md-sidenav-backdrop')),
                                    menu_bg_dims = menu_bg[0].getBoundingClientRect(),
                                    divName = event.action.match(/(\w+\d)\.\w+/)[1],
                                    chart = angular.element(
                                        Array.prototype.filter.call(
                                            menu_bg.find('div'),
                                            function (x) {
                                                return (x.id === (divName +'-chart'));
                                            }
                                        )[0])
                                    scope = $scope;

                                if (event.action != "mxSubFeature2.option4") {

                                    if (chart.length < 1) {
                                        if (event.active) menu_bg.append('\
                                            <div id="'+ divName +'-chart" class="d3"></div> \
                                        ');
                                        chart = angular.element(
                                            Array.prototype.filter.call(
                                                menu_bg.find('div'),
                                                function (x) {
                                                    return (x.id === (divName +'-chart'));
                                                }
                                            )[0])
                                            .append('\
                                                <mx-d3-chart class="d3" \
                                                             data="data" \
                                                             width="360" \
                                                             height="320" \
                                                             type="\''+ type +'\'">\
                                                </mx-d3-chart>\
                                            ');

                                    } else if (event.active) {
                                        chart[0].innerHTML = '\
                                                <mx-d3-chart class="d3" \
                                                             data="data" \
                                                             width="360" \
                                                             height="320" \
                                                             type="\''+ type +'\'">\
                                                </mx-d3-chart>\
                                            ';

                                    }  else if (!event.active)
                                        chart.remove();

                                } else {

                                    if (chart.length < 1 ) {
                                        if (event.active) menu_bg.append('\
                                            <div id="'+ divName +'-chart" class="d3"></div> \
                                        ');
                                        chart = angular.element(
                                            Array.prototype.filter.call(
                                                menu_bg.find('div'),
                                                function (x) {
                                                    return (x.id === (divName +'-chart'));
                                                }
                                            )[0]);

                                    } else if (!event.active) {
                                        chart.remove();
                                    }

                                    if (chart.length < 1) {
                                        if (event.active)
                                            menu_bg.append('\
                                                <div id="'+ divName +'-chart" class="tab"></div> \
                                            ');

                                        chart = angular.element(
                                            Array.prototype.filter.call(
                                                menu_bg.find('div'),
                                                function (x) {
                                                    return (x.id === (event.super +'-chart'));
                                                }
                                            )[0])
                                            .append('\
                                                <mx-tab-chart data="data" title="'+ event.action +'"></mx-tab-chart>\
                                            ');

                                    } else if (event.active) {
                                        chart[0].innerHTML = '\
                                                <mx-tab-chart data="data" title="'+ event.action +'"></mx-tab-chart>\
                                            ';

                                    } else if (!event.active)
                                        chart[0].innerHTML = "";
                                }

                                $compile(chart.contents())(scope);
                            }
                        }
                    );
                }
            }
        }

        return this;
    }
]);
