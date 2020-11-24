# TPE Bases de Datos II
## Nosedive, Black Mirror
### MongoDB + Redis

# What to Install
- npm install mongodb
- npm install csv-parser
- npm install fs
- npm install random-words
- npm install redis
- npm install random-location

# Populate MongoDB
`node populate.js file.csv linesToProcess rateCount [DROP]`

Where 
- `file.csv` is a csv file with headers YearOfBirth,Name,Sex,Number 
- `linesToProcess` is a number (> 0) to set maxLines to process
- `rateCount` is a number (>= 0) to set the number of rates to generate between added users
- `[DROP]` indicates if the collection should be dropped before inserting.

Eg: `node populateMongo.js babyNamesUSYOB-full.csv 10 20 DROP`

# Rate a user
`node ratePerson.js score from-id to-id [lat lon]`

Where
- `score` is an integer between 1 and 5
- `from-id` is an existing person id, the person who makes the rating
- `to-id` is an existing person id, the person who recieves the rating
- `lat` is the latitude where the rating is made, `lon` is the longitude where the rating is made. If only one or none of them are provided, defaults to ITBA's coordinates

Eg: `node ratePerson.js 4 wonderful8 mountain9 -21.21 22.22`