//console.log("In state data")
//console.log(window.location.search) 
const params = new URLSearchParams(window.location.search)
const satename = params.get('name');
console.log(satename);

var StateEnergySourceURL = `http://localhost:5000/state/production?name=${satename}`;
var StateProdConsURL = `http://localhost:5000/state/ranking?name=${satename}`;

// create the initial function for the initial data selection
function buildDropdown() {
    // selecting dropdown menu
    var newID = d3.select("#selDataset");

    // Fetch the JSON data and console log it
    d3.json("data/state_abbreviations.json").then(function(data) {
        console.log('this is data', data);

        Object.entries(data).forEach(function([keys,values]) {
            newID.append("option").text(values).property("value", keys);
            //console.log([keys,statename])
            if (keys===satename){
                console.log(document.getElementById("selDataset").options)
            }
        });

    for (var option of document.getElementById("selDataset").options) {
            if (option.value === satename) {
            option.selected = true;
            
            }
        }  

    });
       
    //var initId = states[0];
    //console.log(satename)
    //document.getElementById("selDataset").forEach(function(val)).value='nj';
    // =satename

}

d3.selectAll("#selDataset").on("change", stateChange);

//function to change url based on state selected
function stateChange() {

    var dropdownMenu = d3.select("#selDataset");
    // Assign the value of the dropdown menu option to a variable
    var state = dropdownMenu.property("value");
    console.log(state)
    var currenturl = window.location.href.split('/')[0];
    console.log(currenturl)
    var newurl = currenturl + `state.html?name=${state}`
    window.location.href = newurl;

}
    // // function to change url based on state selected
    // function stateChange(state) {
    //     // target url
    //     var baseUrl = window.location.href?name=${state}`;

    //     // change url and navigate
    //     window.location.assign(baseUrl);
    //   }

    //   // create the initial function for the initial data selection
    //   function buildDropdown() {
    //       // selecting dropdown menu
    //       var newID = d3.select("#selDataset");

    //       // Fetch the JSON data and console log it
    //       d3.json("data/state_abbreviations.json").then(function(data) {
    //           console.log(data);
    //           var states = data.names;
    //           // inserting a dropdown option for each name id
    //           states.forEach((sample) => {
    //               newID.append("option").text(sample).property("value", sample);
    //           });
    //           var initId = states[0];

    //           




// create a function for the state info table
function stateSummary() {
    console.log("hello1");
    // read the data
    d3.json(StateProdConsURL).then(function(StatePCdata2) {

        console.log(StatePCdata2)
        var StatePCdata = StatePCdata2[0];



        var CO2Emissions = StatePCdata['Carbon Dioxide Emission']
        var CO2EmissionsRank = StatePCdata['Carbon Dioxide Emission Rank']
        var consumptionPerCapita = StatePCdata['Consumption per capita']
        var consumptionRank = StatePCdata['Consumption Rank']
        var expendituresperCapita = StatePCdata['Expenditure per capita']
        var expendituresRank = StatePCdata['Expenditure Rank']
        var productionShare = StatePCdata['Production Share']
        var productionRank = StatePCdata["Production Rank"]

        var tableDataArr = [

            CO2Emissions, // 1
            CO2EmissionsRank, // 2
            consumptionPerCapita, // 3
            consumptionRank, // 4
            expendituresperCapita, //5
            expendituresRank, //6
            productionShare, //7
            productionRank
        ]

        // select the demographic table
        var getSummary = d3.select("#state-table");

        // clear the demographic table
        getSummary.html("");

        var statename = d3.select("#statename")
        console.log(statename)
        statename.append("h2").text(`${StatePCdata["State Name"]}`)
            .append("p")

        //statename.attribute()
        // loop through the info in the StatePCdata and append results to table
        Object.entries(StatePCdata).slice(0, -2).forEach((key) => {
            console.log(key)
            getSummary.append("tr").text(key[0] + ": " + key[1] + "\n");
        });
    }).
    catch(function errorHandler(err) {
        err.message; // 'Oops!'
    });
}
//Function to create doughnut chart with new library chart.js
function buildCharts() {
    console.log("hello2");
    d3.json(StateEnergySourceURL).then(function(stateEData2) {
        console.log(stateEData2[0]);

        var stateEData = stateEData2[0];
        // var pielabels = Object.entries(stateEData).map(key =>
        //     key)

        var coal = stateEData["Fossil Fuel - Coal"]; //["Fossil Fuel - Coal"]
        console.log(stateEData);
        var naturalGas = stateEData["Fossil Fuel - Natural Gas"]; //["Fossil Fuel - Natural Gas"]
        var crudeOil = stateEData['Fossil Fuel - Crude Oil']; //['Fossil Fuel - Crude Oil']
        var nuclear = stateEData['Nuclear Power']; //['Nuclear Power']
        var bioFuels = stateEData['BioFuels']; //['BioFuels']
        var woodWaste = stateEData['Wood and Waste']; //['Wood and Waste']
        var other = stateEData['Other']; //['Other']

        var pieDataArr = [

                coal, // 1
                naturalGas, // 2
                crudeOil, // 3
                nuclear, // 4
                bioFuels, //5
                woodWaste, //6
                other //7

            ]
            //var values = Object.entries(stateEData).map((key, value) => value)

        var ctx = document.getElementById('pieChart')
        var myPieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: pieDataArr,
                    backgroundColor: [
                        'rgb(191, 63, 63)',
                        'rgb(86, 239, 35)',
                        'rgb(239, 188, 35)',
                        'rgb(35, 86, 239)',
                        'rgb(239, 86, 35)',
                        'rgb(188, 35, 239)',
                        '#74c476',
                    ]
                }],
                labels: ["Fossil Fuel - Coal",
                    "Fossil Fuel - Natural Gas",
                    "Fossil Fuel - Crude Oil",
                    "Nuclear Power",
                    "BioFuels",
                    "Wood and Waste",
                    "Other"
                ]
            },
            options: {
                title: {
                    display: true,
                    text: "State Energy production by Source (million BTU)",
                    fontSize: 20, 
                    fontColor: "white"
                },
                legend: {
                    position: 'right',
                    alignment: 'center',
                    
                    labels: {
                        boxWidth: 10,
                        fontColor: "white"
                    }
                }
            }
        });
        return myPieChart
    }).
    catch(function errorHandler(err) {
        err.message; // 'Oops!'
    });
};


//initializing all the functions
function init() {
    buildDropdown();
    buildCharts();
    stateSummary();
    // createData();
    
};


init();