// Creating layers for map
// Adding tile layer
var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 10,
    minZoom: 4,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
});

//Initialize all of the LayerGroups
var layers = {
    CONSUMPTION: new L.LayerGroup(),
    PRODUCTION: new L.LayerGroup(),
    EMISSIONS: new L.LayerGroup()
};

// Define a map object
var myMap = L.map("map", {
    center: [40, -95],
    zoom: 4,
    layers: [
        layers.PRODUCTION
    ]
});

lightmap.addTo(myMap);

// Create an overlays object to add to layer control
var overlays = {
    "Production": layers.PRODUCTION,
    "Consumption": layers.CONSUMPTION,
    "CO2 Emissions": layers.EMISSIONS
};

// Pass our map layers into our layer control
// Add the layer control to the map
L.control.layers(overlays, null, { collapsed: false }).addTo(myMap);

var path = "data/states.geojson";

d3.json(path, function(err, data) {
    if (err) console.log("error fetching data");
    console.log(data);

    function statedata(statename) {
        //console.log("Inside - On click method")
        var currenturl = window.location.href.split('/')[0];
        console.log(currenturl)
        var newurl = currenturl + `state.html?name=${statename}`
        window.location.href = newurl;
    }

    // State Energy Production layer
    var geojsonP = L.choropleth(data, {

        // Define what property in the features to use
        valueProperty: "ProductionShare",

        // Set color scale
        scale: ["#c7e9b4", "#0c2c84"],
        steps: 8,
        mode: "q",
        style: {
            // Border color
            color: "#fff",
            weight: 1,
            fillOpacity: 0.8
        },

        onEachFeature: function(feature, layer) {

            // Set mouse events to change map styling on mouseover and mouseout
            layer.on({
                mouseover: function(event) {
                    layer = event.target;
                    layer.setStyle({
                        fillOpacity: 1
                    });
                },
                mouseout: function(event) {
                    layer = event.target;
                    layer.setStyle({
                        fillOpacity: 0.8
                    });
                },
                click: function(event) {
                    console.log(event.target.feature.properties.StateAbbreviation)
                    statedata(event.target.feature.properties.StateAbbreviation)
                }
            });

            // Binding a pop-up to each layer
            layer.bindTooltip(feature.properties.NAME + "<br>" + feature.properties.ProductionShare + " trillion BTU" + "<br>" +
                "Rank: " + feature.properties.ProductionRank);
        }

    }).addTo(layers.PRODUCTION);

    var geojsonC = L.choropleth(data, {

        // Define what property in the features to use
        valueProperty: "ConsumptionShare",

        // Set color scale
        scale: ["#dadaeb", "#4a1486"],
        steps: 8,
        mode: "q",
        style: {
            // Border color
            color: "#fff",
            weight: 1,
            fillOpacity: 0.8
        },

        onEachFeature: function(feature, layer) {

            // Set mouse events to change map styling on mouseover and mouseout
            layer.on({
                mouseover: function(event) {
                    layer = event.target;
                    layer.setStyle({
                        fillOpacity: 1
                    });
                },
                mouseout: function(event) {
                    layer = event.target;
                    layer.setStyle({
                        fillOpacity: 0.8
                    });
                },
                click: function(event) {
                    console.log(event.target.feature.properties.StateAbbreviation)
                    statedata(event.target.feature.properties.StateAbbreviation)
                }
            });

            // Binding a pop-up to each layer
            layer.bindTooltip(feature.properties.NAME + "<br>" + feature.properties.ConsumptionShare + " million BTU" + "<br>" +
                "Rank: " + feature.properties.ConsumptionRank);
        }

    }).addTo(layers.CONSUMPTION);

    // State Energy Emissions layer
    var geojsonE = L.choropleth(data, {

        // Define what property in the features to use
        valueProperty: "CarbonDioxideShare",

        // Set color scale
        scale: ["#ffffb2", "#b10026"],
        steps: 8,
        mode: "q",
        style: {
            // Border color
            color: "#fff",
            weight: 1,
            fillOpacity: 0.8
        },

        onEachFeature: function(feature, layer) {

            // Set mouse events to change map styling on mouseover and mouseout
            layer.on({
                mouseover: function(event) {
                    layer = event.target;
                    layer.setStyle({
                        fillOpacity: 1
                    });
                },
                mouseout: function(event) {
                    layer = event.target;
                    layer.setStyle({
                        fillOpacity: 0.8
                    });
                },
                click: function(event) {
                    console.log(event.target.feature.properties.StateAbbreviation)
                    statedata(event.target.feature.properties.StateAbbreviation)
                }
            });

            // Binding a pop-up to each layer
            layer.bindTooltip(feature.properties.NAME + "<br>" + feature.properties.CarbonDioxideShare + " million metric tons" + "<br>" +
                "Rank: " + feature.properties.CarbonDioxideRank);
        }

    }).addTo(layers.EMISSIONS);

    // Set up the legend for total energy production
    var legendC = L.control({ position: "bottomleft" });
    legendC.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        var limits = geojsonC.options.limits;
        var colors = geojsonC.options.colors;
        var labels = [];

        // Add min & max
        var legendInfo = "<p>Consumption per Capita (million BTU)</p>" +
            "<div class=\"labels\">" +
            "<div class=\"min\">" + limits[0] + "</div>" +
            "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
            "</div>";

        div.innerHTML = legendInfo;

        limits.forEach(function(limit, index) {
            labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
        });

        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div;
    };

    // Set up the legend for energy consumption
    var legendP = L.control({ position: "bottomleft" });
    legendP.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        var limits = geojsonP.options.limits;
        var colors = geojsonP.options.colors;
        var labels = [];

        // Add min & max
        var legendInfo = "<p>Total Energy Production (trillion BTU)</p>" +
            "<div class=\"labels\">" +
            "<div class=\"min\">" + limits[0] + "</div>" +
            "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
            "</div>";

        div.innerHTML = legendInfo;

        limits.forEach(function(limit, index) {
            labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
        });

        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div;
    };

    // Set up the legend for total energy production
    var legendE = L.control({ position: "bottomleft" });
    legendE.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        var limits = geojsonE.options.limits;
        var colors = geojsonE.options.colors;
        var labels = [];

        // Add min & max
        var legendInfo = "<p>CO2 Emissions (million metric tons)</p>" +
            "<div class=\"labels\">" +
            "<div class=\"min\">" + limits[0] + "</div>" +
            "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
            "</div>";

        div.innerHTML = legendInfo;

        limits.forEach(function(limit, index) {
            labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
        });

        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div;
    };

    legendP.addTo(myMap);

    myMap.on('baselayerchange', function (eventLayer) {
      // Switch to the PRODUCTION legend...
        console.log(eventLayer.name)
         if (eventLayer.name === 'Production') {
             this.removeControl(legendC);
             this.removeControl(legendE);
             legendP.addTo(this);
        }
        else if (eventLayer.name === 'Consumption') { // Or switch to the CONSUMPTION legend...
             this.removeControl(legendP);
             this.removeControl(legendE);
             legendC.addTo(this);
        }
        else { // Or switch to the EMISSION legend...
            this.removeControl(legendP);
            this.removeControl(legendC);
            legendE.addTo(this);
       }
    });
});