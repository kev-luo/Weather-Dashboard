$(document).ready(function() {

  $("#search-button").on("click", function() {
    var city = $("#search-value").val();
    $("#search-value").val('');
    getWeather(city);
  });

  function createRow()

  // temp F, humidity, wind speed mph, uv index
  function getWeather(city) {

    var queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=ca0ab1a31e65e2e155aab80479e17dc2&units=imperial`;

    $.ajax({
      type: "GET",
      url: queryURL,
    }).then(function(response) {

        if (cityHist.indexOf(response.name) == -1) {
          cityHist.push(response.name);
        }
        
        localStorage.setItem("history",JSON.stringify(cityHist));

        var mainCard = $("<div>",{
          "class": "card",
        })

        var cardBody = $("<div>",{
          "class": "card-body"
        });

        // get date
        var day = new Date();
        var convertedDay = day.toLocaleDateString();

        // main card city+date+emoji
        var cityText = $("<h3>",{
          "class": "card-title",
          text: response.name + ' (' + convertedDay + ')'
        })

        // today temp
        var temperature = $("<p>",{
          "class": "card-text",
          text: response.main.temp
        })

        // today humidity
        var humidity = $("<p>",{
          "class": "card-text",
          text: response.main.humidity
        })

        // today wind speed
        var windSpeed = $("<p>",{
          "class": "card-text",
          text: response.wind.speed
        })
        
        cardBody.append(cityText, temperature, humidity, windSpeed);
        mainCard.append(cardBody);
        $("#today").append(mainCard);

        // call UVdata
        getUV(response.coord.lat,response.coord.lon);

    })
  }
    
  

  // function to get UV
  function getUV(lati,long) {
    $.ajax({
      url: `http://api.openweathermap.org/data/2.5/uvi?lat=${lati}&lon=${long}&appid=ca0ab1a31e65e2e155aab80479e17dc2`,
      method: "GET"
    }).then(function(sunRays) {

      // today UV
      var uV = $("<p>");

      var uVBtn = $("<span>",{
        "class": "btn btn-sm",
        text: sunRays.value
      })

      if (sunRays.value < 3) {
        uVBtn.addClass("btn-success");
      } else if (sunRays.value < 7) {
        uVBtn.addClass("btn-warning");
      } else {
        uVBtn.addClass("btn-danger");
      }

      uV.append(uVBtn);
      $("#today .card-body").append(uV);

    })




  }  
        

  var cityHist = JSON.parse(localStorage.getItem("history")) || [];

  if (cityHist.length>0) {
    getWeather(cityHist[cityHist.length-1]);
  }

  for (var i=0; i<cityHist.length; i++) {
    $(".history").empty();
    var newLi = $("<li>");
    newLi.text(cityHist[i]);
    $(".history").append(newLi);
  }


});


