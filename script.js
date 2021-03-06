$(document).ready(function() {

  // triggers api call when search button is clickced
  $("#search-button").on("click", function() {
    if ($("#search-value").val() !== '') {
      var city = $("#search-value").val().trim();
      $("#search-value").val('');
      getWeather(city);
    }
  });

  // triggers api call when user presses enter while typing
  $("#search-value").on("keypress", function(event) {
    if (event.keyCode == '13' && $("#search-value").val() !== '') {
      var city = $("#search-value").val().trim();
      $("#search-value").val('');
      getWeather(city);
    }
  });

  // clear local storage
  $("#clear-history").on("click", function() {
    localStorage.clear();
    $(".history").empty();
  })

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

        var mainCol = $("<div>", {
          "class": "col-md-4"
        })

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
          text: `Temperature: ${response.main.temp}°F`
        })

        // temp range
        var tempRange = $("<p>",{
          "class": "card-text",
          text: `Range: ${response.main.temp_min}° - ${response.main.temp_max}°F`
        })

        // today humidity
        var humidity = $("<p>",{
          "class": "card-text",
          text: `Humidity: ${response.main.humidity}%`
        })

        // today wind speed
        var windSpeed = $("<p>",{
          "class": "card-text",
          text: `Wind Speed: ${response.wind.speed} MPH`
        })

        var sunRise = getRegTime(response.sys.sunrise);
        var sunSet = getRegTime(response.sys.sunset);

        // today sunrise
        var sunRiseText = $("<p>",{
          "class": "card-text",
          text: `Sunrise: ${sunRise}am`
        })

        // today sunset
        var sunSetText = $("<p>",{
          "class": "card-text",
          text: `Sunset: ${sunSet}pm`
        })
        
        cityText.append(mainImg);
        cardBody.append(cityText, temperature, tempRange, humidity, windSpeed, sunRiseText, sunSetText);
        mainCard.append(cardBody);
        mainCol.append(mainCard);
        $("#today").append(mainCol);
        console.log(response);
        // call UVdata
        getUV(response.coord.lat,response.coord.lon);

        // call forecast
        getForecast(city);

        // call hourly
        getHourly(response.coord.lat,response.coord.lon);
    })
  }
  
  // function to get 5 day forecast
  function getForecast(city) {
    $.ajax({
      url: `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=ca0ab1a31e65e2e155aab80479e17dc2&units=imperial`,
      method: "GET"
    }).then(function(response) {

      $("#forecast").empty();
      // $("#forecast").addClass("row");

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
            text: `Temp: ${response.list[i].main.temp}°F`
          })

          // forecast humidity
          var forecastHumidity = $("<p>",{
            "class": "card-text",
            text: `Humidity: ${response.list[i].main.humidity}%`
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

  // get hourly data for graph
  function getHourly(latit, longi) {
    $.ajax({
      url: `https://api.openweathermap.org/data/2.5/onecall?lat=${latit}&lon=${longi}&exclude=current,mintely,daily,alerts&appid=ca0ab1a31e65e2e155aab80479e17dc2&units=imperial`,
      method: "GET"
    }).then(function(response) {
      console.log(response);
      var timeArray = [];
      var tempArray = [];
      var feelsLikeArray = [];

      // for loop to add data to arrays that will be used for line charts
      for (var i=0; i<12; i++) {
        var unixDate = response.hourly[i].dt;
        var forecastDay = new Date(unixDate*1000);
        timeArray.push(nonMilitary(forecastDay))
        tempArray.push(response.hourly[i].temp);
        feelsLikeArray.push(response.hourly[i].feels_like)
      }
      var graphCol = $("<div>", {
        "class": "col-md-8"
      })

      var graphCard = $("<div>",{
        "class": "card"
      })

      var graphCardBody = $("<div>",{
        "class": "card-body p-2"
      });

      var newCanv = $("<canvas>",{
        id: "myChart"
      })

      // create line chart with actual temperature and feels like temperature
      var ctx = newCanv.get(0).getContext('2d');
      var chart = new Chart(ctx, {
          type: 'line',
      
          data: {
              labels: timeArray,
              datasets: [{
                  label: 'Actual Temp',
                  borderColor: 'rgb(255, 99, 132)',
                  data: tempArray,
                  fill: false
              }, {
                  label: 'Feels Like Temp',
                  borderColor: 'rgb(61, 100, 251)',
                  data: feelsLikeArray,
                  fill: false
              }]
          },
      
          options: {
              responsive: true,
              title: {
                  display: true,
                  text: '12-Hour Forecast'
              },
              tooltips: {
                  mode: 'index',
                  intersect: 'true'
              },
              hover: {
                  mode: 'nearest',
                  intersect: true
              },
              scales: {
                  xAxes: [{
                      display: true,
                      scaleLabel: {
                          display: true,
                          labelString: 'Month'
                      }
                  }],
                  yAxes: [{
                      display: true,
                      scaleLabel: {
                          display: true,
                          labelString: '°F'
                      }
                  }]
              }
          }
      });

      graphCardBody.append(newCanv);
      graphCard.append(graphCardBody);
      graphCol.append(graphCard);
      $("#today").append(graphCol);

    })
  }

  // return non-military time
  function nonMilitary(date) {
    var hours = date.getHours();
    var convertedTime = (hours+24)%12;

    if (hours > 12) {
      return convertedTime.toString()+'pm';
    } else if (hours < 12 && hours > 0) {
      return convertedTime.toString()+'am';
    } else if (hours === 0) {
      return '12am';
    } else {
      return '12pm';
    }
      
  }

  // return regular time from unix time
  function getRegTime(unixTime) {
    var day = new Date(unixTime * 1000);
    var hours = (day.getHours() + 24)%12 || 12;
    var minutes = day.getMinutes();
    return (`${hours}:${minutes}`);
  }

  // update historical searches rows
  createRow(cityHist);

});


