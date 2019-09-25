var myBarChart;
query(jQuery);
function query($) {
  $("#chart-show-btn").click(function() {
    $(".chart-container").addClass("chart-container-invisibility");
    $(".amortization-table").addClass("table-container-visibility");
    // $(".graph-table-footer").addClass("btn-up");
  });
  $("#graph-show-btn").click(function() {
    $(".chart-container").removeClass("chart-container-invisibility");
    $(".amortization-table").removeClass("table-container-visibility");
    // $(".graph-table-footer").removeClass("btn-up");
  });
}

// calculate mortgage
document
  .getElementById("mortgage-form")
  .addEventListener("submit", calculateMortgage);

function calculateMortgage(e) {
  e.preventDefault();

  let principalMortgageAmountStr = document
    .getElementById("mortgage-principal-amount")
    .value.trim();
  let interestRateStr = document.querySelector("#interest-rate").value.trim();
  let mortgageTermContainer = document.getElementById("mortgage-term");
  let mortgageTermStr =
    mortgageTermContainer.options[mortgageTermContainer.selectedIndex].value;
  let paymentFrequencyContainer = document.getElementById("payment-frequency");
  let paymentFrequencyStr =
    paymentFrequencyContainer.options[paymentFrequencyContainer.selectedIndex]
      .value;
  let amortizationPeriodContainer = document.getElementById(
    "amortization-period"
  );
  let amortizationPeriodStr =
    amortizationPeriodContainer.options[
      amortizationPeriodContainer.selectedIndex
    ].value;
  // remove , from the mortgage amount
  principalMortgageAmountStr = makeMortgageInNumber(principalMortgageAmountStr);
  // value.replace(",", "");

  // validation

  if (
    validation(
      principalMortgageAmountStr,
      interestRateStr,
      mortgageTermStr,
      paymentFrequencyStr,
      amortizationPeriodStr
    )
  ) {
    location.replace("#output-field-container");
    const mortgageAmountErr = document.getElementById(
      "mortgage-amount-error-message"
    );
    const interestRateErr = document.getElementById(
      "interest-rate-error-message"
    );
    const mortgageTermErr = document.getElementById(
      "mortgage-term-error-message"
    );
    const paymentFrequencyErr = document.getElementById(
      "payment-frequency-error-message"
    );
    const amortizationPeriodErr = document.getElementById(
      "amortization-period-error-message"
    );
    mortgageAmountErr.innerHTML = "";
    interestRateErr.innerHTML = "";
    mortgageTermErr.innerHTML = "";
    paymentFrequencyErr.innerHTML = "";
    amortizationPeriodErr.innerHTML = "";
    // change to num
    let principalMortgageAmount = parseInt(principalMortgageAmountStr);
    let interestRate = parseFloat(interestRateStr) / 100;
    let mortgageTerm = parseInt(mortgageTermStr);
    let paymentFrequency = parseInt(paymentFrequencyStr);
    let amortizationPeriod = parseInt(amortizationPeriodStr);

    // get periodic interest factor
    let periodicInterestRate = 0;
    //check the payment Frequency and calcuate periodic interest
    if (paymentFrequency === 12) {
      periodicInterestRate =
        Math.pow(Math.pow(1 + interestRate / 2, 2), 1 / 12) - 1;
      console.log(periodicInterestRate);
    }
    if (paymentFrequency === 24) {
      periodicInterestRate =
        Math.pow(Math.pow(1 + interestRate / 2, 2), 1 / 24) - 1;
      console.log(periodicInterestRate);
    }
    if (paymentFrequency === 26) {
      periodicInterestRate =
        Math.pow(Math.pow(1 + interestRate / 2, 2), 1 / 26) - 1;
      console.log(periodicInterestRate);
    }
    if (paymentFrequency === 52) {
      periodicInterestRate =
        Math.pow(Math.pow(1 + interestRate / 2, 2), 1 / 52) - 1;
      console.log(periodicInterestRate);
    }

    // calculate
    let numberOfTotalPayment = paymentFrequency * amortizationPeriod;
    let numberOfCurrentTermPayment = paymentFrequency * mortgageTerm;
    let periodicMortgageAmount =
      (principalMortgageAmount * periodicInterestRate) /
      (1 - (1 + periodicInterestRate) ** -numberOfTotalPayment);

    // display monthly payment
    document.getElementById("display-monthly-mortgage-amount").innerHTML =
      "$" + parseFloat(periodicMortgageAmount).toFixed(2);

    //get monthly interest amount, end balance & principal
    let arrayOfInterestAmount = [];
    let endOfBalanceAmount = [];
    let perodicInterestAmount = 0;
    for (var i = 0; i < numberOfTotalPayment; i++) {
      perodicInterestAmount = principalMortgageAmount * periodicInterestRate;
      endOfBalanceAmount.push(principalMortgageAmount);
      principalMortgageAmount =
        principalMortgageAmount -
        (periodicMortgageAmount - perodicInterestAmount);
      arrayOfInterestAmount.push(perodicInterestAmount);
    }

    let currentTermInterestAmount = 0;
    // calcuate the For Current term amount
    for (var i = 0; i < numberOfCurrentTermPayment; i++) {
      currentTermInterestAmount += arrayOfInterestAmount[i];
    }
    let atAmortizationInterestAmount = 0;
    // calcuate the At amortization amount
    for (var i = 0; i < numberOfTotalPayment; i++) {
      atAmortizationInterestAmount += arrayOfInterestAmount[i];
    }
    let endOfPrincipalAmount = 0;
    // calcuate the end of term balance
    endOfPrincipalAmount = endOfBalanceAmount[numberOfCurrentTermPayment];
    // display the info in the Interest Amount section
    document.getElementById("amount-for-current-term").innerHTML =
      "$" +
      parseFloat(currentTermInterestAmount)
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, "$&,");

    document.getElementById("amount-at-amortization").innerHTML =
      "$" +
      parseFloat(atAmortizationInterestAmount)
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, "$&,");

    document.getElementById("amount-at-end-of-term-balance").innerHTML =
      "$" +
      parseFloat(endOfPrincipalAmount)
        .toFixed(2)
        .replace(/\d(?=(\d{3})+\.)/g, "$&,");

    //  get data for line graph
    let arrayOfPrincipalMortgageAmount = [];
    let yearly = paymentFrequency;
    for (var i = 0; i < numberOfTotalPayment; i++) {
      if (yearly == i) {
        arrayOfPrincipalMortgageAmount.push(
          parseFloat(endOfBalanceAmount[yearly]).toFixed(2)
        );
        yearly = yearly + paymentFrequency;
      }
    }
    let numberOfPaymentForGraph = [];
    for (var i = 0; i < amortizationPeriod; i++) {
      numberOfPaymentForGraph.push(i + 1);
    }

    // line graph
    document.getElementById("myBarChart").innerHTML = "";
    var ctx = document.getElementById("myBarChart").getContext("2d");
    Chart.defaults.global.defaultFontColor = "rgb(255,255, 255)";

    if (myBarChart) {
      myBarChart.destroy();
    }
    myBarChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: numberOfPaymentForGraph,
        datasets: [
          {
            label: "Balance: $",
            data: arrayOfPrincipalMortgageAmount,
            backgroundColor: [
              "rgba(255,255,255, 0.7)",
              "rgba(255,255,255, 0.7)",
              "rgba(255,255,255, 0.7)",
              "rgba(255,255,255, 0.7)",
              "rgba(255,255,255, 0.7)"
            ],
            borderColor: [
              "rgba(255,255,255, 0.7)",
              "rgba(255,255,255, 0.7)",
              "rgba(255,255,255, 0.7)",
              "rgba(255,255,255, 0.7)",
              "rgba(255,255,255, 0.7)"
            ],
            borderWidth: 1
          }
        ]
      },
      options: {
        title: {
          display: false
        },
        legend: {
          display: true,
          labels: {
            fontColor: "rgb(255,255, 255)"
          }
        },
        scales: {
          scaleLabel: { fontColor: "rgba(255,255, 255)" },
          xAxes: [
            {
              gridLines: {
                color: "rgba(255,255, 255, 0.4)"
              }
            }
          ],
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
                // Include a dollar sign in the ticks
                callback: function(value, index, values) {
                  return "$" + value;
                }
              },
              gridLines: {
                color: "rgba(255,255, 255, 0.4)"
              }
            }
          ]
        }
      }
    });
    //table data
    //end of term balance
    let arrayOfYearlyPrincipalAmount = [];
    let arrayOfYearlyPaymentAmount = [];
    let arrayOfYearlyInterestAmount = [];
    let arrayOfMortgageTermPeriod = [];
    let annualYearlyInterestAmount = 0;
    // obtain info for the table.
    yearly = paymentFrequency;
    var k = 1;
    for (var i = 0; i < numberOfCurrentTermPayment; i++) {
      annualYearlyInterestAmount += arrayOfInterestAmount[i];

      if (yearly == i + 1) {
        // period
        arrayOfMortgageTermPeriod.push(k);
        // interest amount
        arrayOfYearlyInterestAmount.push(
          parseFloat(annualYearlyInterestAmount).toFixed(2)
        );
        //payment
        arrayOfYearlyPaymentAmount.push(
          parseFloat(periodicMortgageAmount * paymentFrequency).toFixed(2)
        );
        //principal
        arrayOfYearlyPrincipalAmount.push(
          parseFloat(
            periodicMortgageAmount * paymentFrequency -
              annualYearlyInterestAmount
          ).toFixed(2)
        );
        annualYearlyInterestAmount = 0;
        yearly = yearly + paymentFrequency;
        k++;
        // console.log(arrayOfMortgageTermPeriod[i]);

        // console.log("payment amount = " + arrayOfYearlyPaymentAmount[i]);
        // console.log("principal amount = " + arrayOfYearlyPrincipalAmount[i]);
      }
    }

    //display data

    let MyTable = document.getElementById("amortization-table");

    MyTable.innerHTML = "";

    for (var i = 0; i < mortgageTerm; i++) {
      let NewRow = MyTable.insertRow(i);
      let Newcell1 = NewRow.insertCell(0);
      let Newcell2 = NewRow.insertCell(1);
      let Newcell3 = NewRow.insertCell(2);
      let Newcell4 = NewRow.insertCell(3);
      let Newcell5 = NewRow.insertCell(4);
      Newcell1.innerHTML = arrayOfMortgageTermPeriod[i];
      Newcell2.innerHTML =
        "$" + arrayOfYearlyPaymentAmount[i].replace(/\d(?=(\d{3})+\.)/g, "$&,");
      Newcell3.innerHTML =
        "$" +
        arrayOfYearlyPrincipalAmount[i].replace(/\d(?=(\d{3})+\.)/g, "$&,");
      Newcell4.innerHTML =
        "$" +
        arrayOfYearlyInterestAmount[i].replace(/\d(?=(\d{3})+\.)/g, "$&,");
      Newcell5.innerHTML =
        "$" +
        arrayOfPrincipalMortgageAmount[i].replace(/\d(?=(\d{3})+\.)/g, "$&,");
    }
  }

  function validation(
    principalMortgageAmountStr,
    interestRateStr,
    mortgageTermStr,
    paymentFrequencyStr,
    amortizationPeriodStr
  ) {
    const mortgageAmountErr = document.getElementById(
      "mortgage-amount-error-message"
    );
    const interestRateErr = document.getElementById(
      "interest-rate-error-message"
    );
    const mortgageTermErr = document.getElementById(
      "mortgage-term-error-message"
    );
    const paymentFrequencyErr = document.getElementById(
      "payment-frequency-error-message"
    );
    const amortizationPeriodErr = document.getElementById(
      "amortization-period-error-message"
    );
    mortgageAmountErr.innerHTML = validateMortgageAmount(
      principalMortgageAmountStr
    );
    interestRateErr.innerHTML = validateInterestRate(interestRateStr);

    mortgageTermErr.innerHTML = validateMortgageTerm(mortgageTermStr);

    paymentFrequencyErr.innerHTML = validatePaymentFrequency(
      paymentFrequencyStr
    );

    amortizationPeriodErr.innerHTML = validateAmortizationPeriod(
      amortizationPeriodStr
    );
    return (
      mortgageAmountErr.innerHTML === "" &&
      interestRateErr.innerHTML === "" &&
      mortgageTermErr.innerHTML === "" &&
      paymentFrequencyErr.innerHTML === "" &&
      amortizationPeriodErr.innerHTML === ""
    );
  }
}
function validateMortgageAmount(value) {
  if (isEmpty(value)) {
    return "Please input your mortgage principal amount";
  } else if (!isNumber(value)) {
    return "Please input only number";
  } else {
    return "";
  }
}
function validateInterestRate(value) {
  if (isEmpty(value)) {
    return "Please input your interest rate";
  } else if (!isNumber(value)) {
    return "Please input only number";
  } else if (!isNumberLessThan100(value)) {
    return "Please input your interest rate less than 100%";
  } else {
    return "";
  }
}
function validateMortgageTerm(value) {
  if (isEmpty(value)) {
    return "Invalid!";
  } else {
    return "";
  }
}
function validatePaymentFrequency(value) {
  if (isEmpty(value)) {
    return "Invalid!";
  } else {
    return "";
  }
}
function validateAmortizationPeriod(value) {
  if (isEmpty(value)) {
    return "Invalid!";
  } else {
    return "";
  }
}

// validation functions
function isEmpty(valueString) {
  return valueString === "";
}
function isNumber(valueString) {
  for (letter of valueString) {
    if (letter !== ".") {
      if (isNaN(parseInt(letter))) {
        return false;
      }
    }
  }
  return true;
}

function isNumberLessThan100(valueString) {
  return parseInt(valueString) <= 100;
}
function makeMortgageInNumber(principalMortgageAmountStr) {
  for (let i = 0; i < principalMortgageAmountStr.length; i++) {
    if (principalMortgageAmountStr[i] === "$") {
      const p = principalMortgageAmountStr.substring(0, i);
      const a = principalMortgageAmountStr.substring(
        i + 1,
        principalMortgageAmountStr.length
      );
      principalMortgageAmountStr = p + a;
      console.log(principalMortgageAmountStr);
    }
    if (principalMortgageAmountStr[i] === ",") {
      const p = principalMortgageAmountStr.substring(0, i);
      const a = principalMortgageAmountStr.substring(
        i + 1,
        principalMortgageAmountStr.length
      );
      principalMortgageAmountStr = p + a;
      console.log(principalMortgageAmountStr);
    }
  }
  return principalMortgageAmountStr;
}
