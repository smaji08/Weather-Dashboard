var apiKey = "APPID=25475d88742bbd67291eb692e4e7b093";
var baseURL = "http://api.openweathermap.org/data/2.5/";
var tempUnits = "imperial"; //metric

$(document).ready(function(){
    
    var searchCity = "Hartford";
    var queryURL = baseURL + "weather?q=" + searchCity +"&units=" + tempUnits+ "&" + apiKey;
    var cityLat;
    var cityLon;
    var cityName;

    $.ajax({
        url: queryURL,
        method: "GET"
        })
    .then(function(response){

        cityName = response.name;
        cityLat = response.coord.lat;
        cityLon = response.coord.lon;
        var icon = response.weather[0].icon;

        $("#latestCity").text(cityName);
        $("#todaysDate").text("(" + moment().format('L') + ")");
        $("#imgCondition").append($("<img>").attr("src","http://openweathermap.org/img/wn/" + icon +"@2x.png"));
        $(".currentcity").append($("<p>").text("Temperature : " + response.main.temp + " \u2109"));
        $(".currentcity").append($("<p>").text("Humidity : " + response.main.humidity + "%"));
        $(".currentcity").append($("<p>").text("Wind Speed : " + response.wind.speed + " MPH"));
        
        getuvindex(cityLat,cityLon);
        getforecast(cityName);
    });
    
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
            var imgIcon = $("<img>").attr("src","http://openweathermap.org/img/wn/" + icon +"@2x.png")
            var pTemp = $("<p>").text("Temp : " + response.list[i].main.temp + " \u2109");
            var pHumid = $("<p>").text("Humidity : " + response.list[i].main.humidity + "%"); 
            colDiv.append(pDate,imgIcon,pTemp,pHumid);
            rowDiv.append(colDiv);
        }

    });

}
    
});