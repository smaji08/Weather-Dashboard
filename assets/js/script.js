var apiKey = "APPID=25475d88742bbd67291eb692e4e7b093";
var baseURL = "https://api.openweathermap.org/data/2.5/";
var tempUnits = "imperial"; //metric

$(document).ready(function(){
    
    var searchCity;
    var queryURL;
    var cityLat;
    var cityLon;
    var cityName;
    var cities = [];

    // var retrievedCities = localStorage.getItem("cities");
    
    //retrieving the stored objects
    // if (retrievedCities !== null){
    //     retrievedCities = JSON.parse(retrievedCities);
    // }
    // else{
    //     localStorage.setItem("cities", JSON.stringify(cities));
    // }
    // localStorage.setItem("cities", JSON.stringify(retrievedCities));
    $(document).on("click",".citybutton",function(){
        cityName = $(this)[0].dataset.city;
        rendercity(cityName);
    });

    $("button").on("click",function(event){

        event.preventDefault();
        
        searchCity = $(".addcity").val().trim();
        if (searchCity === ""){
            return;
        }
        cities.push(searchCity);
        
        var listDiv = $(".cities");
        var liTag = $("<button>").text(searchCity);
        liTag.attr("data-city",searchCity);
        liTag.addClass("list-group-item list-group-item-action list-group-item-primary citybutton");
        listDiv.append(liTag);
        $(".addcity").val("");
        rendercity(searchCity);

    });    
    
    function rendercity(searchCity){
    queryURL = baseURL + "weather?q=" + searchCity +"&units=" + tempUnits+ "&" + apiKey;

    $(".currentcity").empty();
    $(".fivedays").empty();  
    
    $.ajax({
        url: queryURL,
        method: "GET"
        })
    .then(function(response){

        cityName = response.name;
        cityLat = response.coord.lat;
        cityLon = response.coord.lon;
        var icon = response.weather[0].icon;

        var h3 = $("<h3>");
        h3.append($("<span>").text(cityName));
        h3.append($("<span>").text("(" + moment().format('L') + ")"));
        h3.append($("<span>").append($("<img>").attr("src","https://openweathermap.org/img/wn/" + icon +"@2x.png")));
        
        $(".currentcity").append(h3);
        $(".currentcity").append($("<p>").text("Temperature : " + response.main.temp + " \u2109"));
        $(".currentcity").append($("<p>").text("Humidity : " + response.main.humidity + "%"));
        $(".currentcity").append($("<p>").text("Wind Speed : " + response.wind.speed + " MPH"));
        
        getuvindex(cityLat,cityLon);
        getforecast(cityName);
    });
    }
    function getuvindex(lat,lon){
                
        queryURL = baseURL + "uvi?"+ apiKey + "&lat=" + lat + "&lon=" +lon;
        
        $.ajax({
            url: queryURL,
            method: "GET"
            })
        .then(function(response){
                
                var pUVI = $("<p>").text("UV Index : ");
                var spanUVI = $("<span>").text(response.value);
                spanUVI.attr("class","uvindex");
                pUVI.append(spanUVI);
                $(".currentcity").append(pUVI);
        }); 

    }

    function getforecast(city){
    queryURL = baseURL + "forecast?q=" + city + "&units=" + tempUnits + "&" + apiKey;

    $.ajax({
        url: queryURL,
        method: "GET"
    })
    .then(function(response){

        console.log(response);
        
        for (var i=0;i<40;i+=8){
            var rowDiv = $(".fivedays");
            var colDiv = $("<div>").attr("class","col-sm-2 eachday");
        
            var splitDateTime = response.list[i].dt_txt.split(" ");
            var dateArr = splitDateTime[0].split("-");
            var dateNew = dateArr[1] + "/" + dateArr [2] +"/" + dateArr[0];
            var icon = response.list[i].weather[0].icon;
            
            var pDate = $("<h5>").text(dateNew);
            var imgIcon = $("<img>").attr("src","https://openweathermap.org/img/wn/" + icon +"@2x.png")
            var pTemp = $("<p>").text("Temp : " + response.list[i].main.temp + " \u2109");
            var pHumid = $("<p>").text("Humidity : " + response.list[i].main.humidity + "%"); 
            colDiv.append(pDate,imgIcon,pTemp,pHumid);
            rowDiv.append(colDiv);
        }

    });

}


    
});