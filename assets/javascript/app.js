$(document).ready(function() {
  //To specifically allow military time format entry for start time
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
  var localArray = [];
  var audio = new Audio("./ChooChoo.mp3");

  //Submit button triggers all input fields to be stored in Firebase
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

  //Delete button on click causes removal in Firebase
  $(document).on("click", ".btn-warning", function() {
    console.log(this);
    var recordID = $(this).attr("data-delete");
    database.ref(recordID).remove();
  });

  //On child added in Firebase, construct row on schedule
  database.ref().on(
    "child_added",
    function buildTable(snap) {
      //defining variable for physical table building
      var table = $("#tableData");
      var row = $("<tr>");

      //defining variable for the time now and start time for calculation
      var now = moment().format("HH:mm");
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
      var nextArrTD = `<td class="nA${snap.ref.key}">${nextArr}</td>`;

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
          audio.play();
          // var audio = $("<iframe>");
          // audio.attr("src", "ChooChoo.mp3");
          // audio.attr("style", "display:none");
          // audio.attr("id", "iframeAudio");
          // audio.attr("allow", "autoplay");
          // audio.remove();
        } else {
          textmsg = minAway;
          minAwayTD = `<td><span class="${
            snap.ref.key
          }">${textmsg}</span></td>`;
        }
      }
      minAwayZero();

      var alterTD = `<td><span id="eD${snap.ref.key}"></span><span id="dE${
        snap.ref.key
      }"></span></td>`;

      // Create edi button
      var editLink = $("<a>");
      editLink.attr("data-edit", snap.ref.key);
      editLink.attr("href", "#");
      editLink.text("Edit");

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
      row.append(alterTD);
      table.append(row);
      $("#eD" + snap.ref.key).append(editLink);
      $("#dE" + snap.ref.key).append(delButton);

      //Blink 'boarding now' msg for trains that have arrived
      if (textmsg === "Boarding Now") {
        $("." + snap.ref.key).blink({ delay: 500 });
      }

      var fireObject = snap.val();
      fireObject.key = snap.ref.key; //adding key identifier into object
      localArray.push(fireObject);
      console.log(localArray);
    },
    function(error) {}
  );

  //Firebase record removal triggers removal of row from schedule
  database.ref().on("child_removed", function(snap) {
    var recordID = snap.ref.key;
    $("#" + recordID).remove();
    var indexToBeDeleted = findWithAttr(localArray, "key", recordID);
    localArray.splice(indexToBeDeleted, 1);
    console.log(localArray);
  });

  //function used to update schedule every minute. Code repeated from buildTable()
  function updateTime() {
    for (i = 0; i < localArray.length; i++) {
      var updateKey = localArray[i].key; //used to identify which train to update
      var freq = localArray[i].frequency;

      now = moment().format("HH:mm");
      then = localArray[i].startTime;
      timeDiffToNow = moment
        .utc(moment(now, "HH:mm").diff(moment(then, "HH:mm")))
        .format("HH:mm");
      timeDiffToNowInMinutes = moment.duration(timeDiffToNow).asMinutes();
      nextArrMultiple = Math.ceil(timeDiffToNowInMinutes / freq) * freq;
      nextArr = moment(
        moment(then, "HH:mm").add(nextArrMultiple, "minutes")
      ).format("HH:mm");
      $(".nA" + updateKey).html(nextArr); //this homes in to the exact td for update

      console.log("Train" + i + ":" + then + "," + freq + "," + nextArr);
      minAway = freq - (timeDiffToNowInMinutes % freq);
      function minAwayZeroUpdate() {
        if (minAway == freq) {
          textmsg = "Boarding Now";
          $("." + updateKey).text(textmsg); //this hones in to the exact td for update
          audio.play();
        } else {
          textmsg = minAway;
          $("." + updateKey).text(textmsg);
        }
      }
      $("." + updateKey).unblink(); //clears any prior blinking function to prevent stacking
      minAwayZeroUpdate();
      if (textmsg === "Boarding Now") {
        $("." + updateKey).blink({ delay: 500 });
      }
    }
  }

  setInterval(updateTime, 60000); //updates schedule every minute

  var audio = new Audio("ChooChoo.mp3");
  audio.play();

  function findWithAttr(array, attr, value) {
    for (var i = 0; i < array.length; i += 1) {
      if (array[i][attr] == value) {
        return i;
      }
    }
    return -1;
  }
});
