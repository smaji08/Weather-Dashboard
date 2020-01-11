var apiKey = "APPID=25475d88742bbd67291eb692e4e7b093";
var baseURL = "https://api.openweathermap.org/data/2.5/";
var tempUnits = "imperial";

$(document).ready(function(){
    
    var cities = []; 
    var listDiv = $(".cities");
    
    $(".currentcity").hide();
    $(".yourlocation").hide();
    
    //to get the current location --- BONUS point ----
    function findme(){
        if (!navigator.geolocation) {
            $(".yourlocation").show();
            $(".yourlocation").append($("<p>").html("<strong>Geolocation is not supported by your browser</strong>"));
        }
        else {
            navigator.geolocation.getCurrentPosition(success,error);
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
    
    //locastorage handling 
    if(localStorage["cities"]){
        cities = JSON.parse(localStorage["cities"]);
        //if localsorage not empty rendering the cities from the cities array
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

    //on clicking each city button the weather of the corresponding city is displayed
    $(document).on("click",".citybutton",function(){
        cityName = $(this)[0].dataset.city;
        rendercity(cityName);
    });

    //on clicking clear city button, it clears the localstorage and cities array and the rendering Div
    $(document).on("click",".clearcities", function(){
        localStorage.clear();
        listDiv.empty();
        cities.length = 0;
        $(".currentcity").hide();
        $(".fivedays").hide();
    });

    //adding searched cities to the list as buttons and adding that to the localstorage as well
    $("#searchCity").on("click",function(){

        var inputSearchCity = $(".addcity").val().trim().toLowerCase();
        if (inputSearchCity === ""){
            return;
        }

        inputSearchCity = inputSearchCity.split(" ");
        searchCity = "";
        
        //Capitalizing the first letters of cities' each word
        inputSearchCity.forEach(element => {
            searchCity +=   " " + element.charAt(0).toUpperCase() + element.slice(1);
        });
        
        //prevents to add an already existing citi to the list as well as to localstorage
        if (cities.includes(searchCity)){
            $(".addcity").val("");
            return;
        }
        cities.push(searchCity);
        localStorage.setItem("cities", JSON.stringify(cities));

        //displaying the searched citi names on the left pane
        liTag = $("<button>").html("<b>" + searchCity + "</b>");
        liTag.attr("data-city",searchCity);
        liTag.addClass("list-group-item list-group-item-action list-group-item-primary citybutton");
        listDiv.append(liTag);
        $(".addcity").val("");
        rendercity(searchCity);

    });    
    
    //Main Ajax call -- displaying the current selected citi's weather
    function rendercity(searchCity){
        queryURL = baseURL + "weather?q=" + searchCity +"&units=" + tempUnits+ "&" + apiKey;
        $(".currentcity").show();
        $(".currentcity").empty();
        $(".fivedays").empty();  
        
        $.ajax({
            url: queryURL,
            method: "GET",
            statusCode: {
                404: function() {
                    $(".currentcity").hide();
                    alert("Sorry! City" + searchCity+" not found");
                }
            }
        })
        .then(function(response){
            console.log(response);
            cityName = response.name;
            cityID = response.id;
            countryName = response.sys.country;
            cityLat = response.coord.lat;
            cityLon = response.coord.lon;
            var icon = response.weather[0].icon;
            
            //displayijg current time along with cityname and countryname
            var h3 = $("<h3>");
            $(".currentcity").append($("<h4>").text(moment().format('ll')));
            h3.append($("<span>").text(cityName + ", " + countryName));
            
            //images for the icons and if sunny clear sky (code = 01d), one custom sunny icon added
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

    //Your location is displayed on a div passing the lat and long retrieved using Geolocation to the ajax call
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

    //ajax call for the UVIndex element
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

    //ajax call for the 5-day forecast
    function getforecast(cityID){
        $(".fivedays").show();
        queryURL = baseURL + "forecast?id=" + cityID + "&units=" + tempUnits + "&" + apiKey;
        
        $.ajax({
            url: queryURL,
            method: "GET"
        })
        .then(function(response){
            
            //function to return the weekday of the date
            function dayOfWeekAsString(dayIndex) {
                return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dayIndex];
            }            
            
            //the for loop to get 1 record each from every day for the next 5 days
            var myDate = new Date();

            for (var i=0;i<40;i++){
                var rowCont = $(".fivedays");
                var colDiv = $("<div>").attr("class","col-sm-2 eachday");
                
                var tempDate = new Date(response.list[i].dt_txt);
                var icon = response.list[i].weather[0].icon;

                if (myDate.getDate() === tempDate.getDate()){
                    continue;
                }
                else{
                    myDate = tempDate;
                }
                
                //date formatting
                var dateNew = (myDate.getMonth()+1)+"/"+myDate.getDate()+"/"+myDate.getFullYear();
                var day = dayOfWeekAsString(myDate.getDay());
                day = day.slice(0,3).toUpperCase();

                //just rendering different shades for alternative divs
                if ((myDate.getDate())%2 == 0){
                    colDiv.attr("style","background-color:rgb(8, 165, 152)");
                }

                var pDate = $("<h5>").text(dateNew);
                var pDay = $("<p>").html("<b>" + day +"</b>");
                pDay.addClass("day");

                if (icon == "01d"){
                    var imgIcon = $("<img>").attr({src:"assets/images/sunny.png",height: "40%", width:"85%"});
                }
                else{
                    var imgIcon = $("<img>").attr("src","https://openweathermap.org/img/wn/" + icon +"@2x.png");
                }

                var pTemp = $("<p>").text("Temp: " + Math.round(response.list[i].main.temp) + " \u2109");
                pTemp.css("font-size","16px");
                var pHumid = $("<p>").text("Humidity: " + response.list[i].main.humidity + "%"); 
                colDiv.append(pDate,pDay,imgIcon,pTemp,pHumid);
                rowCont.append(colDiv);
            }

        });
    }
});