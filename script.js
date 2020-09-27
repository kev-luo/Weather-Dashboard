$(document).ready(function() {

  // triggers api call when search button is clickced
  $("#search-button").on("click", function() {
    var city = $("#search-value").val().trim();
    $("#search-value").val('');
    getWeather(city);
  });

  // creates historical searches row
  function createRow(histSearch) {
    $(".history").empty();

    for (var i=0; i<histSearch.length; i++) {
      var newLi = $("<button>", {
        "class":"list-group-item list-group-item-action"
      });
      newLi.text(histSearch[i]);
      $(".history").append(newLi);
    }
  }

  // enable display updates through historical searches list
  $(".history").on("click", "button", function(event) {
    event.preventDefault();
    getWeather($(this).text());
  })


  // temp F, humidity, wind speed mph, uv index
  function getWeather(city) {

    var queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=ca0ab1a31e65e2e155aab80479e17dc2&units=imperial`;

    $.ajax({
      type: "GET",
      url: queryURL,
    }).then(function(response) {

        // clears what's currently displayed the today element
        $("#today").empty();

        // add current search to historical searches if it's not currently in there
        if (cityHist.indexOf(response.name) == -1) {
          cityHist.push(response.name);
        }
        
        // set value of "history" key in local storage equal to updated historical searches array
        localStorage.setItem("history",JSON.stringify(cityHist));

        // updates list of historical searches
        createRow(cityHist);

        var mainCard = $("<div>",{
          "class": "card",
        })

        var cardBody = $("<div>",{
          "class": "card-body"
        });

        // get date
        var day = new Date();
        var convertedDay = day.toLocaleDateString();

        // emoji
        var mainIcon = response.weather[0].icon;
        var mainImg = $("<img>",{
          src:`http://openweathermap.org/img/wn/${mainIcon}.png`
        });

        // main card city+date
        var cityText = $("<h3>",{
          "class": "card-title",
          text: `${response.name} (${convertedDay})`
        })

        // today temp
        var temperature = $("<p>",{
          "class": "card-text",
          text: `Temperature: ${response.main.temp}`
        })

        // today humidity
        var humidity = $("<p>",{
          "class": "card-text",
          text: `Humidity: ${response.main.humidity}`
        })

        // today wind speed
        var windSpeed = $("<p>",{
          "class": "card-text",
          text: `Wind Speed: ${response.wind.speed}`
        })
        
        cityText.append(mainImg);
        cardBody.append(cityText, temperature, humidity, windSpeed);
        mainCard.append(cardBody);
        $("#today").append(mainCard);

        // call UVdata
        getUV(response.coord.lat,response.coord.lon);

        // call forecast
        getForecast(city);
    })
  }
    
  function getForecast(city) {
    $.ajax({
      url: `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=ca0ab1a31e65e2e155aab80479e17dc2&units=imperial`,
      method: "GET"
    }).then(function(response) {

      $("#forecast").empty();
      $("#forecast").addClass("row");

      for (var i=0; i<response.list.length; i++) {
        if(response.list[i].dt_txt.indexOf("15:00:00") !== -1) {

          var col = $("<div>", {
            "class": "col-md-2"
          })

          var forecastCard = $("<div>",{
            "class": "card text-white bg-primary"
          })
    
          var forecastCardBody = $("<div>",{
            "class": "card-body p-2"
          });
          
          // get date
          var unixDate = response.list[i].dt;
          var forecastDay = new Date(unixDate*1000);
          var convertedDay = forecastDay.toLocaleDateString();

          // forecast card date
          var forecastDate = $("<h3>",{
            "class": "card-title",
            text: convertedDay
          })

          // emoji
          var imgId = response.list[i].weather[0].icon;
          var forecastImg = $("<img>",{
            src:`http://openweathermap.org/img/wn/${imgId}.png`
          })

          // forecast temp
          var forecastTemperature = $("<p>",{
            "class": "card-text",
            text: `Temp: ${response.list[i].main.temp}`
          })

          // forecast humidity
          var forecastHumidity = $("<p>",{
            "class": "card-text",
            text: `Humidity: ${response.list[i].main.humidity}`
          })
          
          forecastCardBody.append(forecastDate, forecastImg, forecastTemperature, forecastHumidity);
          forecastCard.append(forecastCardBody);
          col.append(forecastCard);
          $("#forecast").append(col);
        }
      }
    })
  }

  // function to get UV
  function getUV(lati,long) {
    $.ajax({
      url: `https://api.openweathermap.org/data/2.5/uvi?lat=${lati}&lon=${long}&appid=ca0ab1a31e65e2e155aab80479e17dc2`,
      method: "GET"
    }).then(function(sunRays) {

      // today UV
      var uV = $("<p>",{
        text: "UV Index: "
      });

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

  // upon page load, get values for "history" key from local storage, assign to cityHist variable
  var cityHist = JSON.parse(localStorage.getItem("history")) || [];

  // if there are historical searches, set the current display to be equal to the most recent search
  if (cityHist.length>0) {
    getWeather(cityHist[cityHist.length-1]);
  }

  // update historical searches rows
  createRow(cityHist);

});


