var apiKey = "APPID=25475d88742bbd67291eb692e4e7b093";
var baseURL = "https://api.openweathermap.org/data/2.5/";
var tempUnits = "imperial";

$(document).ready(function(){
    
    var searchCity;
    var queryURL;
    var cityLat;
    var cityLon;
    var cityName;
    var cityID;
    var cities = []; 
    var listDiv = $(".cities");
    var liTag;
    $(".currentcity").hide();
    $(".yourlocation").hide();
    function findme(){
        if (!navigator.geolocation) {
            $(".yourlocation").show();
            $(".yourlocation").append($("<p>").html("<strong>Geolocation is not supported by your browser</strong>"));
        }
        else {
            navigator.geolocation.getCurrentPosition(success, error);
        }

        function success(position){
            $(".yourlocation").show();
            var latitude  = position.coords.latitude;
            var longitude = position.coords.longitude;
            iamhere(latitude,longitude);
        }
        function error() {
            $(".yourlocation").show();
            $(".yourlocation").append($("<p>").html("<i>Sorry!! Unable to retrieve your location</i>"));
        }
    }
    
    findme();
    
    if(localStorage["cities"]){
        cities = JSON.parse(localStorage["cities"]);

        cities.forEach(element => {
            liTag = $("<button>").html("<b>" + element + "</b>");
            liTag.attr("data-city",element);
            liTag.addClass("list-group-item list-group-item-action list-group-item-primary citybutton");
            listDiv.append(liTag);
        });
        rendercity(cities[cities.length-1]);
    }
    else{
        console.log("no cities");
    }


    $(document).on("click",".citybutton",function(){
        cityName = $(this)[0].dataset.city;
        rendercity(cityName);
    });


    $("#searchCity").on("click",function(event){

        event.preventDefault();
        
        var inputSearchCity = $(".addcity").val().trim();
        if (inputSearchCity === ""){
            return;
        }

        inputSearchCity = inputSearchCity.split(" ");
        searchCity = "";
        
        inputSearchCity.forEach(element => {
            searchCity +=   " " + element.charAt(0).toUpperCase() + element.slice(1);
        });
        
        if (cities.includes(searchCity)){
            $(".addcity").val("");
            return;
        }
        cities.push(searchCity);
        localStorage.setItem("cities", JSON.stringify(cities));

        liTag = $("<button>").html("<b>" + searchCity + "</b>");
        liTag.attr("data-city",searchCity);
        liTag.addClass("list-group-item list-group-item-action list-group-item-primary citybutton");
        listDiv.append(liTag);
        $(".addcity").val("");
        rendercity(searchCity);

    });    
    
    function rendercity(searchCity){
        queryURL = baseURL + "weather?q=" + searchCity +"&units=" + tempUnits+ "&" + apiKey;
        $(".currentcity").show();
        $(".currentcity").empty();
        $(".fivedays").empty();  
        
        $.ajax({
            url: queryURL,
            method: "GET"
            })
        .then(function(response){

            console.log(response);
            cityName = response.name;
            cityID = response.id;
            countryName = response.sys.country;
            cityLat = response.coord.lat;
            cityLon = response.coord.lon;
            var icon = response.weather[0].icon;
            
            var h3 = $("<h3>");
            $(".currentcity").append($("<h4>").text(moment().format('ll')));
            h3.append($("<span>").text(cityName + ", " + countryName));
                       
            if (icon == "01d"){
                h3.append($("<span>").append($("<img>").attr({src:"assets/images/sunny.png",height: "15%", width:"20%"})));
            }
            else{
                h3.append($("<span>").append($("<img>").attr("src","https://openweathermap.org/img/wn/" + icon +"@2x.png")));
            }
            
            var spanTemp = $("<span>");
            spanTemp.html(Math.round(response.main.temp) + " \u2109");
            spanTemp.addClass("spantemp");
            h3.append(spanTemp);
            $(".currentcity").append(h3);
            $(".currentcity").append($("<p>").html("<b>Humidity : " + response.main.humidity + "%</b>"));
            $(".currentcity").append($("<p>").html("<b>Wind Speed : " + response.wind.speed + " MPH</b>"));
            
            getuvindex(cityLat,cityLon);
            getforecast(cityID);
        });
    }

    function iamhere(latitude,longitude){
        queryURL = baseURL + "weather?lat=" + latitude + "&lon=" +longitude + "&units=" + tempUnits+ "&" + apiKey;

        $.ajax({
            url: queryURL,
            method: "GET"
            })
        .then(function(response){
            
            $(".yourlocation").append($("<h5>").text("You are in :"));
            $(".yourlocation").append($("<h3>").append($("<span>").text(response.name + ", " + response.sys.country)));
            $(".yourlocation").append($("<h4>").append($("<span>").text( Math.round(response.main.temp) + " \u2109")));
            
        }); 
    }

    function getuvindex(lat,lon){
                
        queryURL = baseURL + "uvi?"+ apiKey + "&lat=" + lat + "&lon=" +lon;
        
        $.ajax({
            url: queryURL,
            method: "GET"
            })
        .then(function(response){
                
            var pUVI = $("<p>").html("<b>UV Index : <b>");
            var spanUVI = $("<span>").html("<b>"+ response.value + "</b>");
            spanUVI.attr("class","uvindex");
            pUVI.append(spanUVI);
            $(".currentcity").append(pUVI);
        }); 

    }

    function getforecast(cityID){
        queryURL = baseURL + "forecast?id=" + cityID + "&units=" + tempUnits + "&" + apiKey;

        $.ajax({
            url: queryURL,
            method: "GET"
        })
        .then(function(response){

            $(".currentcityrow").after($("<h4>").html("<b>5-Day Forecast</b>"));
            
            function dayOfWeekAsString(dayIndex) {
                return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dayIndex];
            }            
            
            for (var i=0;i<40;i+=7){
                var rowCont = $(".fivedays");
                var colDiv = $("<div>").attr("class","col-sm-2 eachday");

                if (i%2 == 0){
                    colDiv.attr("style","background-color:rgb(9, 146, 135)");
                }
            
                var myDate = new Date(response.list[i].dt_txt);
                var sysdate = new Date();

                if (myDate.getDate() === sysdate.getDate()){
                    continue;
                }
                
                var dateNew = (myDate.getMonth()+1)+"/"+myDate.getDate()+"/"+myDate.getFullYear();
                var icon = response.list[i].weather[0].icon;
                var day = dayOfWeekAsString(myDate.getDay());
                day = day.slice(0,3).toUpperCase();

                var pDate = $("<h5>").text(dateNew);
                var pDay = $("<p>").html("<b>" + day +"</b>");
                pDay.addClass("day");

                if (icon == "01d"){
                    var imgIcon = $("<img>").attr({src:"assets/images/sunny.png",height: "40%", width:"85%"});
                }
                else{
                    var imgIcon = $("<img>").attr("src","https://openweathermap.org/img/wn/" + icon +"@2x.png");
                }

                var pTemp = $("<p>").text("Temp : " + Math.round(response.list[i].main.temp) + " \u2109");
                pTemp.css("font-size","16px");
                var pHumid = $("<p>").text("Humidity : " + response.list[i].main.humidity + "%"); 
                colDiv.append(pDate,pDay,imgIcon,pTemp,pHumid);
                rowCont.append(colDiv);
            }

        });
    }
});