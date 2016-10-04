(function() {

    var app, getlat, getlon, pointGeo, disastertype, userid, userDistrictID, validationId, no, superuser;
    app = angular.module('queup', ['ionic', 'ngCordova']);
    app.config(function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('login', {

            url: '/login',
            templateUrl: 'templates/login.html'

        });
        $stateProvider.state('edit', {
            url: '/edit/:id',
            templateUrl: 'templates/edit.html'
        });

        $stateProvider.state('map', {
            url: '/map',
            templateUrl: 'templates/map.html'
        });

        $stateProvider.state('list', {
            url: '/list',
            templateUrl: 'templates/list.html'
        });

        $urlRouterProvider.otherwise('/login');
    });

    //Login Code
    app.controller('LoginController', function($scope, $ionicPopup, $scope, $stateParams, $ionicPopup, $http, $rootScope, $cordovaCamera, $ionicLoading, $cordovaLaunchNavigator, $location) {

        $scope.data = {};
        $scope.login = function() {

            var getname = $scope.data.username;
            var getpw = $scope.data.password;
            var data = {
                username: getname
            };
            //Check Valid User
            $.ajax({
                url: "http://166.63.122.161:8000/api/v1/user/",
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                data: {
                    'username': getname
                },
                success: function(result) {
                    $scope.count = result.objects.length;

                },
                error: function(result) {

                    $scope.count = result.objects.length;

                }
            }).then(function(result) {

                if ($scope.count === 1) {
                    userid = result.objects[0].id;
                    if (result.objects[0].id !== 1) {
                        userDistrictID = result.objects[0].district.id;
                    }
                    superuser = result.objects[0].is_superuser;
                    window.location.href = '#list';
                } else {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Login failed!',
                        subTitle: 'Sorry Please Try Again',
                        template: '<center><div class="image"><img src="img/incorrect.png" width="50" height="50" alt=""> </div></center>'
                    });
                }
            });
        }

    });


    //details Page
    app.controller("DetailsQueueController", function($scope, $stateParams, $ionicPopup, $http, $rootScope, $cordovaCamera, $ionicLoading, $cordovaLaunchNavigator, $location, $state) {

        $scope.logoutdetailPage = function() {
            console.log("done");

            window.location.href = '#login';
            window.location.reload();
        }
        var mydata = {};

        var disId = userDistrictID;

        function listIncidentafterdiscard(data) {
            $.ajax({
                url: "http://166.63.122.161:8000/api/v1/incident/",
                dataType: "jsonp",
                contentType: "application/json; charset=utf-8",
                data: data,
                success: function(result) {
                    console.log(result.objects);

                    $scope.$apply(function() {

                        $scope.data = {

                            list: result.objects,
                            model: null,
                        }

                        $scope.datalist = result.objects;

                        $scope.disimagereturn = function(disastertype) {


                            if (disastertype == "Chemical") {
                                return "img/chemical1.png";
                            } else if (disastertype == "Epedemic") {
                                return "img/epedemic1.png";
                            } else if (disastertype == "ThunderStorm") {
                                return "img/thunderstorm1.png";
                            } else if (disastertype == "Fire") {
                                return "img/fire1.png";
                            } else if (disastertype == "Explosion") {
                                return "img/explosion1.png";
                            } else if (disastertype == "Cyclone") {
                                return "img/cyclone1.png";
                            } else if (disastertype == "Landslides") {
                                return "img/landslide1.png";
                            } else if (disastertype == "Tsunamis") {
                                return "img/tsunami1.png";
                            } else if (disastertype == "Earthquakes") {
                                return "img/earthquake1.png";
                            } else if (disastertype == "Flood") {
                                return "img/flood1.png";
                            } else
                                return "img/drought1.png";
                        }

                    })
                },
                error: function() {
                    console.log('error');
                },

            });
        }

        //verification
        $scope.showverifiedAlert = function() {
            //get verified GPS
            var onSuccess = function(position) {

                var myobject = {
                    latlng: position.coords.latitude + "," + position.coords.longitude,
                    sensor: true
                };

                //  $scope.data.popupLatitude = position.coords.latitude;
                //  $scope.data.popupLongitude = position.coords.longitude;
                // alert( $scope.data.popupLongitude);
                $http.defaults.headers.post['Content-Type'] = 'application/json';
                // get address frpm GPS
                $http({
                    method: 'POST',
                    url: 'http://maps.googleapis.com/maps/api/geocode/json',
                    params: myobject,
                    headers: {
                        'Content-Type': 'application/json '
                    }
                }).success(function(data, status, headers, config) {
                    address = data.results[0].formatted_address;

                    $scope.data.popupAddress = address;

                }).error(function(data, status, headers, config) {
                    // handle error things
                });
            };

            function onError(error) {
                console.log('code: ' + error.code + '\n' +
                    'message: ' + error.message + '\n');
            }
            //route
            navigator.geolocation.getCurrentPosition(onSuccess, onError);

            $scope.data = {}
            var alertPopup = $ionicPopup.show({

                title: '<B>Verify Info',
                template: ' Address <input type="text" style="background-color:#d6dbdf;" ng-model="data.popupAddress" ><br> Comment <input type="text" style="background-color:#d6dbdf;" ng-model="data.popupComment" >',
                scope: $scope,
                buttons: [{
                    text: 'Cancel',
                    onTap: function(e) {
                        window.location.reload();
                    }
                }, {
                    text: '<b>Save</b>',
                    type: 'button-positive',
                    onTap: function(e) {

                        $scope.currDate = new Date();
                        var data = JSON.stringify({
                            "status": "Verified",
                            //  "validated_latitude": parseFloat($scope.data.popupLatitude),
                            //  "validated_longitude": parseFloat($scope.data.popupLongitude),
                            "comment": $scope.data.popupComment,
                            "date": $scope.currDate,
                            "address": $scope.data.address,
                            "user": "http://166.63.122.161:8000/api/v1/user/" + userid + "/"



                        });
                        //send data to validation table
                        $.ajax({
                            url: 'http://166.63.122.161:8000/api/v1/validation/',
                            type: 'POST',
                            contentType: 'application/json; charset=utf-8',
                            data: data,
                            processData: false,
                            dataType: 'json',

                            success: function(result) {
                                console.log('success ', result);
                                console.log('success ', result.id);
                                validationId = result.id;
                                var data = JSON.stringify({
                                    validation: "http://166.63.122.161:8000/api/v1/validation/" + validationId + "/",
                                    is_validated: true


                                });
                                $.ajax({
                                    url: 'http://166.63.122.161:8000/api/v1/incident/' + no + '/',
                                    type: 'PATCH',
                                    crossDomain: true,
                                    contentType: 'application/json; charset=utf-8',
                                    data: data,

                                    dataType: 'json',
                                    success: function(data) {
                                        console.log('success ', data);

                                        window.location.href = '#list';

                                    },
                                    error: function(err) {
                                        //alert(err);
                                    },
                                })
                            },
                            error: function(data) {
                                console.log('error');
                            }
                        })

                    }
                }]
            });
        };


        $scope.showDiscardAlert = function() {
            //get incident details
            $.ajax({
                url: "http://166.63.122.161:8000/api/v1/incident/" + no+'/',
                dataType: "jsonp",
                contentType: "application/json; charset=utf-8",
                success: function(result) {
                console.log(JSON.stringify(result));

                    $scope.$apply(function() {
                    console.log(JSON.stringify(result));
                        $.ajax({
                            url: "http://166.63.122.161:8000/api/v1/disaster/" + result.disaster_type.id + "/",
                            contentType: 'application/json; charset=utf-8',
                            processData: false,
                            dataType: 'json',
                            success: function(data) {
                                $scope.resultDisaster = data;

                            },
                            error: function(result) {
                                console.log('error');
                            }

                        });

                        $scope.resultaddress = result.address;
                        $scope.resultContactno = result.contact_no;
                        $scope.resultdescription = result.description;
                        $scope.resultLatitude = result.latitude;
                        $scope.resultLongitude = result.longitude;
                        $scope.resultName = result.name;
                        $scope.resultReportedDate = result.reported_date;
                        $scope.resultSyncedDate = result.synced_date;
                        $scope.resultDistrict = result.district;
                        $scope.resultProvince = result.province;

                    })
                },
                error: function() {
                    console.log('error');
                },
            });

            //discardPopup
            $scope.data = {}
            var alertPopup = $ionicPopup.show({

                title: '<B>Sure To Remove This Incident',
                buttons: [{
                    text: 'Cancel',
                    onTap: function(e) {
                        window.location.reload();
                    }
                }, {
                    text: '<b>Yes</b>',
                    type: 'button-positive',
                    onTap: function(e) {

                        $scope.currDate = new Date();
                        //alert(JSON.stringify($scope.resultDisaster));

                        var data = JSON.stringify({
                            "address": $scope.resultaddress,
                            "contact_no": $scope.resultContactno,
                            "description": $scope.resultdescription,
                            "latitude": parseFloat($scope.resultLatitude),
                            "longitude": parseFloat($scope.resultLongitude),
                            "name": $scope.resultName,
                            "disaster_type": $scope.resultDisaster,
                            "reported_date": $scope.resultReportedDate,
                            "synced_date": $scope.resultSyncedDate,
                            "district": $scope.resultDistrict,
                            "province": $scope.resultProvince,
                            "deleted_Date": $scope.currDate,
                            "user": "http://166.63.122.161:8000/api/v1/user/" + userid + "/"

                        });

                        //alert(JSON.stringify(data));

                        $.ajax({
                            url: 'http://166.63.122.161:8000/api/v1/garbledincident/',
                            type: 'POST',
                            contentType: 'application/json; charset=utf-8',
                            data: data,
                            dataType: 'json',
                            success: function(data) {
                              console.log(JSON.stringify(data));
                            },
                            error: function(err) {
                                //alert(JSON.stringify(data.error));
                                //alert(jqXHR.status);
                                console.log(err.responseText);
                            },

                        })

                        $.ajax({
                            url: 'http://166.63.122.161:8000/api/v1/incident/' + no + '/',
                            type: 'DELETE',
                            contentType: 'application/json; charset=utf-8',
                            processData: false,
                            dataType: 'json',
                            success: function(result) {
                                $scope.$apply(function() {
                                    console.log("Deleted");
                                    if (superuser == true) {
                                        mydata = {};
                                        listIncidentafterdiscard(mydata);
                                        window.location.href = '#list';

                                    } else {
                                        $.ajax({
                                            url: "http://166.63.122.161:8000/api/v1/district/" + disId + "/",
                                            dataType: "json",
                                            contentType: "application/json; charset=utf-8",

                                            success: function(result) {
                                                console.log(result.objects);

                                                $scope.$apply(function() {
                                                    mydata = {
                                                        district: result.name
                                                    };
                                                    listIncidentafterdiscard(mydata);
                                                    window.location.href = '#list';
                                                })
                                            },
                                            error: function(err) {
                                              console.log(JSON.stringify(err));
                                            },

                                        });
                                    }
                                })
                            },
                            error: function(result) {
                                console.log('error');
                            }
                        });
                    }
                }]
            });

        };
        //show details
        console.log($stateParams.id);
        no = $stateParams.id;
        $scope.no = $stateParams.id;

        //incident image load
        $.ajax({
            url: 'http://166.63.122.161:8000/api/v1/photo/',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: {
                'incident': no
            },
            success: function(result) {
              //alert(JSON.stringify(result));
                $scope.$apply(function() {
                    if (result.objects.length == 0) {

                    } else {
                        $scope.imagearray = result.objects;
                        //alert(JSON.stringify($scope.imagearray));
                    }

                })

            },
            error: function(err) {
                console.log(JSON.stringify(err));
            }
        });

        $.ajax({
            url: "http://166.63.122.161:8000/api/v1/incident/" + no+"/",
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function(result) {
                console.log(result);


                $scope.$apply(function() {

                    $scope.data = {
                        list: result,
                        model: null,
                    }

                    //get icon Image

                    $scope.incidentPlace = result.address;

                    $scope.disimagereturn = function() {

                        var disastertype = result.disaster_type.english;
                        if (disastertype == "Chemical") {
                            return "img/chemical1.png";
                        } else if (disastertype == "Epedemic") {
                            return "img/epedemic1.png";
                        } else if (disastertype == "ThunderStorm") {
                            return "img/thunderstorm1.png";
                        } else if (disastertype == "Fire") {
                            return "img/fire1.png";
                        } else if (disastertype == "Explosion") {
                            return "img/explosion1.png";
                        } else if (disastertype == "Cyclone") {
                            return "img/cyclone1.png";
                        } else if (disastertype == "Landslides") {
                            return "img/landslide1.png";
                        } else if (disastertype == "Tsunamis") {
                            return "img/tsunami1.png";
                        } else if (disastertype == "Earthquakes") {
                            return "img/earthquake1.png";
                        } else if (disastertype == "Flood") {
                            return "img/flood1.png";
                        } else
                            return "img/drought1.png";
                    }
                })
            },
            error: function(jqXHR, exception) {
                //alert(JSON.stringify(data.error));
                var msg = '';
        if (jqXHR.status === 0) {
            msg = 'Not connect.\n Verify Network.';
        } else if (jqXHR.status == 404) {
            msg = 'Requested page not found. [404]';
        } else if (jqXHR.status == 500) {
            msg = 'Internal Server Error [500].';
        } else if (exception === 'parsererror') {
            msg = 'Requested JSON parse failed.';
        } else if (exception === 'timeout') {
            msg = 'Time out error.';
        } else if (exception === 'abort') {
            msg = 'Ajax request aborted.';
        } else {
            msg = 'Uncaught Error.\n' + jqXHR.responseText;
        }
        console.log(msg);
            },

        });

        $scope.launchNavigator = function() {

            var destination = $scope.incidentPlace;
            var start = "";
            $cordovaLaunchNavigator.navigate(destination, start).then(function() {
                console.log("Navigator launched");
            }, function(err) {
                console.error(err);
            });
        };
    });

    app.controller('ListController', function($scope, $http, $rootScope, $cordovaCamera, $ionicLoading, $location, $ionicPopup) {

        $scope.logout = function() {
            window.location.href = '#login';
            window.location.reload();
        }
        $(document).ready(function(){
          console.log($("#mylist li").size());
        });

        function listIncidentafterfilter(data) {
            $.ajax({
                url: "http://166.63.122.161:8000/api/v1/incident/",
                dataType: "jsonp",
                contentType: "application/json; charset=utf-8",
                data: data,
                success: function(result) {
                    console.log(result.objects);

                    $scope.$apply(function() {

                        $scope.data = {

                            list: result.objects,
                            model: null,
                        }

                        $scope.datalist = result.objects;
                        var totcount=  $scope.datalist.length;
                        //alert(totcount);
                        $sc

                        $scope.disimagereturn = function(disastertype) {


                            if (disastertype == "Chemical") {
                                return "img/chemical1.png";
                            } else if (disastertype == "Epedemic") {
                                return "img/epedemic1.png";
                            } else if (disastertype == "ThunderStorm") {
                                return "img/thunderstorm1.png";
                            } else if (disastertype == "Fire") {
                                return "img/fire1.png";
                            } else if (disastertype == "Explosion") {
                                return "img/explosion1.png";
                            } else if (disastertype == "Cyclone") {
                                return "img/cyclone1.png";
                            } else if (disastertype == "Landslides") {
                                return "img/landslide1.png";
                            } else if (disastertype == "Tsunamis") {
                                return "img/tsunami1.png";
                            } else if (disastertype == "Earthquakes") {
                                return "img/earthquake1.png";
                            } else if (disastertype == "Flood") {
                                return "img/flood1.png";
                            }else if (disastertype == "Elephant Attack") {
                                return "img/elephant_attack1.png";
                            } else
                                return "img/drought1.png";
                        }

                    })
                },
                error: function() {
                    console.log('error');
                },

            });
        }




        $rootScope.$on("$ionicView.beforeEnter", function(scopes, states, getlon, getlat, ev) {

            if (superuser == true) {
                mydata = {
                    is_validated: false,
                };
                listIncidentafterfilter(mydata);

            } else {
                $.ajax({
                    url: "http://166.63.122.161:8000/api/v1/district/" + disId + "/",
                    dataType: "json",
                    contentType: "application/json; charset=utf-8",

                    success: function(result) {
                        console.log(result.objects);

                        $scope.$apply(function() {
                            mydata = {
                                district: result.name
                            };
                            listIncidentafterfilter(mydata);

                        })
                    },
                    error: function(err) {
                        console.log(err);
                    },

                });
            }
        });


        var mydata = {};

        var disId = userDistrictID;

        $scope.showError = false;


        $scope.filterpopup = function() {

            //load Districts list
            var array = [];
            if (superuser == true) {

                $.ajax({
                    url: 'http://166.63.122.161:8000/api/v1/district/',
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                    success: function(data) {
                        //  alert(JSON.stringify(data.objects.length));
                        for (var i = 0; i <= data.objects.length - 1;) {

                            array.push(data.objects[i].name);
                            i++;
                        }
                        $scope.filterDistrictdata = {
                            list: array,
                            singleDistrictSelect: null,
                        }

                    },
                    error: function(data) {
                        console.log('error');
                    }

                })
            } else {

                $.ajax({
                    url: 'http://166.63.122.161:8000/api/v1/district/' + userDistrictID + '/',
                    contentType: 'application/json; charset=utf-8',
                    dataType: 'json',
                    success: function(data) {
                        array.push(data.name);
                        $scope.filterDistrictdata = {
                            list: array,
                            singleDistrictSelect: null,
                        }

                    },
                    error: function(data) {
                        console.log('error');
                    }

                })
            }

            //load disasters list
            $.ajax({
                url: "http://166.63.122.161:8000/api/v1/disaster/",
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success: function(result) {
                    $scope.$apply(function() {

                        $scope.filterdata = {
                            list: result.objects,
                            singleSelect: null,
                        }

                    })

                },
                error: function() {
                    console.log('error');
                }

            });

            $scope.filterdata = {
                singleSelect: null,
                multipleSelect: [],
                option1: 'option-1',
            };

            $scope.forceUnknownOption = function() {
                $scope.filterdata.singleSelect = "";
            };

            var selectedDis;

            $scope.selectedDisaster = function(value) {

                var select = $scope.filterdata.singleSelect;
                selectedDis = Number(select);
            };

            var alertPopup = $ionicPopup.show({

                title: '<B>Verify Info',
                template: 'Date From: <input type="Date" style="background-color:#d6dbdf;" ng-model="data.dateFrom"> <br>Date To: <input type="Date" style="background-color:#d6dbdf;" ng-model="data.dateTo"><p ng-if="showError" class="errror">Please enter a date range</p><br> Disaster Type<select class="form-control" style="background-color:#d6dbdf;" ng-model="filterdata.singleSelect" ><option value="" selected="true">SelectType</option><option ng-repeat="obj in filterdata.list " value="{{obj.id}}">{{obj.english}}</option></select><br> District<select class="form-control" style="background-color:#d6dbdf;" ng-model="filterDistrictdata.singleDistrictSelect" ><option value="" selected="true">Select District</option><option ng-repeat="obj in filterDistrictdata.list " >{{obj}}</option></select>',
                scope: $scope,
                buttons: [{
                    text: 'Cancel',
                    onTap: function(e) {

                        if (superuser == true) {
                            mydata = {};
                            listIncidentafterfilter(mydata);
                        } else {
                            $.ajax({
                                url: "http://166.63.122.161:8000/api/v1/district/" + disId + "/",
                                dataType: "json",
                                contentType: "application/json; charset=utf-8",

                                success: function(result) {
                                    console.log(result.objects);

                                    $scope.$apply(function() {
                                        mydata = {
                                            district: result.name
                                        };
                                        listIncidentafterfilter(mydata);
                                    })
                                },
                                error: function() {
                                    console.log('error');
                                },

                            });
                        }
                    }

                }, {
                    text: '<b>Filter</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        $scope.fromDate = $scope.data.dateFrom;
                        $scope.ToDate = $scope.data.dateTo;
                        $scope.Disaster = $scope.filterdata.singleSelect;
                        $scope.District = $scope.filterDistrictdata.singleDistrictSelect;

                        function formattedDate(date) {
                            var d = new Date(date || Date.now()),
                                month = '' + (d.getMonth() + 1),
                                day = '' + d.getDate(),
                                year = d.getFullYear();

                            if (month.length < 2) month = '0' + month;
                            if (day.length < 2) day = '0' + day;

                            return [year, month, day].join('-');
                        }

                        $scope.getToDate = formattedDate($scope.ToDate);
                        $scope.getfromDate = formattedDate($scope.fromDate);


                        if ($scope.District) {

                            if (($scope.Disaster) && ($scope.District)) {

                                $.ajax({
                                    url: "http://166.63.122.161:8000/api/v1/incident/",
                                    dataType: "json",
                                    contentType: "application/json; charset=utf-8",
                                    data: {
                                        'disaster_type': $scope.Disaster,
                                        'district': $scope.District,

                                    },
                                    success: function(result) {
                                        console.log(result.objects);

                                        $scope.$apply(function() {

                                            $scope.data = {

                                                list: result.objects,
                                                model: null,
                                            }

                                        })
                                    },
                                    error: function() {
                                        console.log('error');
                                    },

                                });
                            } else {
                                $.ajax({
                                    url: "http://166.63.122.161:8000/api/v1/incident/",
                                    dataType: "json",
                                    contentType: "application/json; charset=utf-8",
                                    data: {
                                        'district': $scope.District,

                                    },
                                    success: function(result) {
                                        console.log(result.objects);

                                        $scope.$apply(function() {

                                            $scope.data = {

                                                list: result.objects,
                                                model: null,
                                            }

                                        })
                                    },
                                    error: function() {
                                        console.log('error');
                                    },

                                });
                            }
                        } else if ($scope.Disaster) {
                            if (($scope.Disaster) && ($scope.District)) {} else {

                                $.ajax({
                                    url: "http://166.63.122.161:8000/api/v1/incident/",
                                    dataType: "json",
                                    contentType: "application/json; charset=utf-8",
                                    data: {
                                        'disaster_type': $scope.Disaster,

                                    },
                                    success: function(result) {
                                        console.log(result.objects);

                                        $scope.$apply(function() {

                                            $scope.data = {

                                                list: result.objects,
                                                model: null,
                                            }

                                        })
                                    },
                                    error: function() {
                                        console.log('error');
                                    },

                                });
                            }
                        } else if (!$scope.fromDate || !$scope.ToDate) {
                            e.preventDefault();
                            $scope.showError = true;
                        } else if (($scope.ToDate) && ($scope.fromDate)) {

                            if (($scope.ToDate) && ($scope.fromDate) && ($scope.district)) {
                                $.ajax({
                                    url: "http://166.63.122.161:8000/api/v1/incident/",
                                    dataType: "json",
                                    contentType: "application/json; charset=utf-8",
                                    data: {
                                        "reported_date__lte": $scope.getToDate,
                                        "reported_date__gte": $scope.getfromDate,
                                        "district": $scope.district

                                    },
                                    success: function(result) {
                                        console.log(result.objects);

                                        $scope.$apply(function() {

                                            $scope.data = {

                                                list: result.objects,
                                                model: null,
                                            }

                                        })
                                    },
                                    error: function() {
                                        console.log('error');
                                    },

                                });
                            } else if (($scope.ToDate) && ($scope.fromDate) && ($scope.Disaster) && ($scope.district)) {

                                $.ajax({
                                    url: "http://166.63.122.161:8000/api/v1/incident/",
                                    dataType: "json",
                                    contentType: "application/json; charset=utf-8",
                                    data: {
                                        "reported_date__lte": $scope.getToDate,
                                        "reported_date__gte": $scope.getfromDate,
                                        "disaster_type": $scope.Disaster,

                                    },
                                    success: function(result) {
                                        console.log(result.objects);

                                        $scope.$apply(function() {

                                            $scope.data = {

                                                list: result.objects,
                                                model: null,
                                            }

                                        })
                                    },
                                    error: function() {
                                        console.log('error');
                                    },

                                });
                            } else if (($scope.ToDate) && ($scope.fromDate) && ($scope.Disaster) && ($scope.district)) {

                                $.ajax({
                                    url: "http://166.63.122.161:8000/api/v1/incident/",
                                    dataType: "json",
                                    contentType: "application/json; charset=utf-8",
                                    data: {
                                        "reported_date__lte": $scope.getToDate,
                                        "reported_date__gte": $scope.getfromDate,
                                        "district": $scope.district,
                                        "disaster_type": $scope.Disaster


                                    },
                                    success: function(result) {
                                        console.log(result.objects);

                                        $scope.$apply(function() {

                                            $scope.data = {

                                                list: result.objects,
                                                model: null,
                                            }

                                        })
                                    },
                                    error: function() {
                                        console.log('error');
                                    },

                                });
                            }

                            $.ajax({
                                url: "http://166.63.122.161:8000/api/v1/incident/",
                                dataType: "json",
                                contentType: "application/json; charset=utf-8",
                                data: {
                                    "reported_date__lte": $scope.getToDate, //to
                                    "reported_date__gte": $scope.getfromDate //from

                                },
                                success: function(result) {
                                    console.log(result.objects);

                                    $scope.$apply(function() {

                                        $scope.data = {

                                            list: result.objects,
                                            model: null,
                                        }

                                    })
                                },
                                error: function() {
                                    console.log('error');
                                },

                            });
                        }

                    }

                }]
            });
            alertPopup.then(function(res) {
                console.log('Tapped!', res);
                $scope.showError = false;
            });

        }

        var mydata = {};

        var disId = userDistrictID;


        function listIncident(data) {
            $.ajax({
                url: "http://166.63.122.161:8000/api/v1/incident/",
                dataType: "jsonp",
                contentType: "application/json; charset=utf-8",
                data: data,
                success: function(result) {
                    console.log(result.objects);

                    $scope.$apply(function() {

                        $scope.data = {

                            list: result.objects,
                            model: null,
                        }

                        $scope.datalist = result.objects;

                        $scope.disimagereturn = function(disastertype) {


                            if (disastertype == "Chemical") {
                                return "img/chemical1.png";
                            } else if (disastertype == "Epedemic") {
                                return "img/epedemic1.png";
                            } else if (disastertype == "ThunderStorm") {
                                return "img/thunderstorm1.png";
                            } else if (disastertype == "Fire") {
                                return "img/fire1.png";
                            } else if (disastertype == "Explosion") {
                                return "img/explosion1.png";
                            } else if (disastertype == "Cyclone") {
                                return "img/cyclone1.png";
                            } else if (disastertype == "Landslides") {
                                return "img/landslide1.png";
                            } else if (disastertype == "Tsunamis") {
                                return "img/tsunami1.png";
                            } else if (disastertype == "Earthquakes") {
                                return "img/earthquake1.png";
                            } else if (disastertype == "Flood") {
                                return "img/flood1.png";
                            } else if (disastertype == "Elephant Attack") {
                                return "img/elephant_attack1.png";
                            } else
                                return "img/drought1.png";
                        }

                    })
                },
                error: function() {
                    console.log('error');
                },

            });
        }

        if (superuser == true) {
            mydata = {};
            listIncident(mydata);

        } else {
            $.ajax({
                url: "http://166.63.122.161:8000/api/v1/district/" + disId + "/",
                dataType: "json",
                contentType: "application/json; charset=utf-8",

                success: function(result) {
                    console.log(result.objects);

                    $scope.$apply(function() {
                        mydata = {
                            district: result.name
                        };
                        listIncident(mydata);
                    })
                },
                error: function() {
                    console.log('error');
                },

            });
        }




    })

    app.run(function($ionicPlatform) {
        $ionicPlatform.ready(function() {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
        });
    });


})();
