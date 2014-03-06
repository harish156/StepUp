var StepUp = {
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        $(document).on('deviceready',this.onDeviceReady);
    },
    onDeviceReady: function() {
        $("#flip-checkbox").on('change',StepUp.checkState);
        $(document).on('backbutton',StepUp.exitApp);
        $("#flip-checkbox-geo").on('change',StepUp.checkStateGeo);
    },
    exitApp:function(){
        navigator.app.exitApp();
    },
    checkState:function(){
        if($(this).is(":checked")){
            StepUp.accelerometer();
        }
        else{
            StepUp.stopAccelerometer();
        }
    },
    checkStateGeo:function(){
        if($(this).is(":checked")){
            StepUp.geoLocator();
        }
        else{
            StepUp.stopGeoLocator();
        }
    },
    accelerometer:function(){
        var options = {frequency:1000};
        window.localStorage.setItem("accelvector",JSON.stringify([]));
        this.watchID = navigator.accelerometer.watchAcceleration(onSuccess,onError,options);
        function onSuccess(acceleration){
            var x = acceleration.x, y = acceleration.y, z = acceleration.z;
            var v = Math.sqrt(x*x+y*y+z*z);
            $("#acceleration_values").html('V:'+v);
            var accelvector = JSON.parse(window.localStorage.getItem("accelvector"));
            accelvector.push(v);
            window.localStorage.setItem("accelvector",JSON.stringify(accelvector));
        }
        function onError(){
            alert('Error');
        }
    },
    stopAccelerometer:function(){
        navigator.accelerometer.clearWatch(this.watchID);
        this.countSteps();
    },
    geoLocator:function(){
        if(navigator.connection.type != navigator.connection.NONE){
            var options = {timeout:1000};
            this.geoArray = [];
            this.watchGeoID = navigator.geolocation.watchPosition(onSuccess,onError,options);
            function onSuccess(position){

                    var lat = position.coords.latitude, lon = position.coords.longitude;
                    $("#geoLocation_values").html( 'latitude'+lat+'longitude'+lon);
                    this.geoArray.push(position);
            }
        }
        else{
            $("#geoLocation_values").html("<p>No Network access.!Please try again later</p>");
        }
    },
    stopGeoLocator:function(){
        navigator.geolocation.clearWatch(this.watchGeoID);
        var data = this.geoArray;
        var myLonLat =  new google.maps.LatLng(data[0].coords.latitude,
                                       data[0].coords.longitude);
        var myOptions = {zoom:15,center:myLonLat,mapTypeId:google.maps.MapTypeId.ROADMAP};
        var  map = new google.maps.Map(document.getElementById('map-canvas'),
      myOptions);
        var tracCoords = [];
        for(i=0;i<data.length;++i)
        {
             tracCoords.push(new google.maps.LatLng(data[i].coords.latitude,
                                       data[i].coords.longitude));
        }
        var tracPath = new google.maps.Polyline({path:tracCoords,strokeColor:"#FF0000",strokeOpacity:1.0});
        tracPath.setMap(map);
    },

    countSteps:function(){
        var accelvector = JSON.parse(window.localStorage.getItem("accelvector")),steps = 0;
        for(var i=1;i<accelvector.length;++i){
            var vcurrent = accelvector[i],vprevious = accelvector[i-1];
            if(Math.abs(vcurrent - vprevious) > 0.3){
                ++steps;
            }
        }
        $("#acceleration_values").html("<strong>"+steps+"</strong> steps taken!");
    }
};
