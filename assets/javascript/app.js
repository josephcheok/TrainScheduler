$(document).ready(function() {
  $(".timepicker").timepicker({
    timeFormat: "HH:mm",
    interval: 60,
    minTime: "00:00",
    maxTime: "23:59",
    defaultTime: "00:00",
    dynamic: true,
    dropdown: true,
    scrollbar: true
  });

  console.log("connected");

  var database = firebase.database();

  $("#submitButton").on("click", function() {
    var name = $("#nameInput").val();
    var destination = $("#destInput").val();
    var startTime = $("#timeInput").val();
    var frequency = $("#freqInput").val();

    database.ref().push({
      name: name,
      destination: destination,
      startTime: startTime,
      frequency: frequency,
      dateAdded: firebase.database.ServerValue.TIMESTAMP
    });

    $("#nameInput").val("");
    $("#destInput").val("");
    $("#timeInput").val("");
    $("#freqInput").val("");
  });

  $(document).on("click", ".btn-warning", function() {
    console.log(this);
    var recordID = $(this).attr("data-delete");
    database.ref().remove(recordID);
  });

  database.ref().on(
    "child_added",
    function(snap) {
      console.log(snap.val());

      var table = $("#tableData");
      var row = $("<tr>");

      // Create delete button
      var delButton = $("<button>");
      delButton.addClass("btn btn-warning");
      delButton.attr("data-delete", snap.ref.key);
      delButton.text("X");

      //   var months = moment().diff(snap.val().startDate, "months");
      //   var totalBilledAmt = months * parseInt(snap.val().rate);

      var nameTD = "<td>" + snap.val().name + "</td>";
      var destTD = "<td>" + snap.val().destination + "</td>";
      var startTimeTD = "<td>" + snap.val().startTime + "</td>";
      var freqTD = "<td>" + snap.val().frequency + "</td>";
      var nextArrTD = "<td> Whenever </td>";
      var minAwayTD = "<td> Soon-ish </td>";

      row.append(nameTD);
      row.append(destTD);
      row.append(startTimeTD);
      row.append(freqTD);
      row.append(nextArrTD);
      row.append(minAwayTD);
      row.append(delButton);

      table.append(row);
    },
    function(error) {}
  );
});
