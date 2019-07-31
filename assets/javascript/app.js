$(document).ready(function() {
  $(".timepicker").timepicker({
    timeFormat: "HH:mm",
    interval: 60,
    minTime: "00:00",
    maxTime: "23:59",
    defaultTime: "00:00",
    dynamic: true,
    dropdown: false,
    scrollbar: false
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
    database.ref(recordID).remove();
  });

  function getTimeFromMins(mins) {
    // do not include the first validation check if you want, for example,
    // getTimeFromMins(1530) to equal getTimeFromMins(90) (i.e. mins rollover)
    if (mins >= 24 * 60 || mins < 0) {
      throw new RangeError(
        "Valid input should be greater than or equal to 0 and less than 24hrs."
      );
    }
    var h = (mins / 60) | 0,
      m = mins % 60 | 0;
    return moment
      .utc()
      .hours(h)
      .minutes(m)
      .format("HH:mm");
  }

  database.ref().on(
    "child_added",
    function(snap) {
      //defining variable for physical table building
      var table = $("#tableData");
      var row = $("<tr>");

      //defining variable for the time now and start time for calculation
      var now = moment("2019-07-31T15:17:00").format("HH:mm");
      var then = snap.val().startTime;

      //defining the table data elements
      var nameTD = "<td>" + snap.val().name + "</td>";
      var destTD = "<td>" + snap.val().destination + "</td>";
      var startTimeTD = "<td>" + snap.val().startTime + "</td>";
      var freqTD = "<td>" + snap.val().frequency + "</td>";

      //calculation of next train arrival time
      var timeDiffToNow = moment
        .utc(moment(now, "HH:mm").diff(moment(then, "HH:mm")))
        .format("HH:mm");
      var timeDiffToNowInMinutes = moment.duration(timeDiffToNow).asMinutes();
      var nextArrMultiple =
        Math.ceil(timeDiffToNowInMinutes / snap.val().frequency) *
        snap.val().frequency;
      var nextArr = moment(
        moment(then, "HH:mm").add(nextArrMultiple, "minutes")
      ).format("HH:mm");
      var nextArrTD = "<td>" + nextArr + "</td>";

      //calculation of minutes to wait until train arrives
      var minAway =
        snap.val().frequency - (timeDiffToNowInMinutes % snap.val().frequency);
      console.log(minAway);
      var textmsg = "";
      var minAwayTD = "";
      function minAwayZero() {
        if (minAway == snap.val().frequency) {
          textmsg = "Boarding Now";
          minAwayTD = `<td><span class="${
            snap.ref.key
          }">${textmsg}</span></td>`;
        } else {
          textmsg = minAway;
          minAwayTD = `<td>${textmsg}</td>`;
        }
      }
      minAwayZero();

      // Create delete button
      var delButton = $("<button>");
      delButton.addClass("btn btn-warning");
      delButton.attr("data-delete", snap.ref.key);
      delButton.text("X");

      //Appending data onto table by row and assigning Firebase keyID to the row
      row.attr("id", snap.ref.key);
      row.append(nameTD);
      row.append(destTD);
      row.append(startTimeTD);
      row.append(freqTD);
      row.append(nextArrTD);
      row.append(minAwayTD);
      row.append(delButton);
      table.append(row);

      //Blink 'boarding now' msg for trains that have arrived
      $("." + snap.ref.key).blink({ delay: 500 });
    },
    function(error) {}
  );

  database.ref().on("child_removed", function(snap) {
    var recordID = snap.ref.key;
    $("#" + recordID).remove();
  });
});
