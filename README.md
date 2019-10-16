# Train Scheduler

This is a train schedule application that incorporates Firebase to host arrival and departure data. This app will retrieve and manipulate this information with Moment.js. This website will provide up-to-date information about various trains, namely their arrival times and how many minutes remain until they arrive at their station. It also allows the user to change and update existing train line information or to delete them.

## Other Features

Trains that have arrived will trigger an audible train whistle along with a flashing "Boarding Now" sign.

## Technologies Used

- Firebase to store train name, destination, first train time and frequency information. Calculated information such as Next Arrival and Minutes Away are not stored.

- Calculation of Next Arrival and Minutes Away are done with Moment.js

- Blinking message of "Boarding Now" is done with blink.js

## Notes on Audio

Chrome automatically disallows sound files to be played automatically unless prompted by the user. In order to get the "Choo Choo" on arrival, you would need to go to Google Chrome settings -> Advanced Settings -> Sound and add my website to your Allow list for Sound.
