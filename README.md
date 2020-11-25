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

# Populate MongoDB + Redis Locations
`node populate.js file.csv linesToProcess rateCount redisPort [DROP]`

Where 
- `file.csv` is a csv file with headers YearOfBirth,Name,Sex,Number 
- `linesToProcess` is a number (> 0) to set maxLines to process
- `rateCount` is a number (>= 0) to set the number of rates to generate between added users
- `redisPort` is a number (> 0) that indicates the port where redis locations is running
- `[DROP]` indicates if the collection should be dropped before inserting.

Eg: `node populate.js babyNamesUSYOB-full.csv 10 20 6379 DROP`

# Rate a user
`node ratePerson.js score from-id to-id [lat lon]`

Where
- `score` is an integer between 1 and 5
- `from-id` is an existing person id, the person who makes the rating
- `to-id` is an existing person id, the person who recieves the rating
- `lat` is the latitude where the rating is made, `lon` is the longitude where the rating is made. If only one or none of them are provided, defaults to ITBA's coordinates

Eg: `node ratePerson.js 4 wonderful8 mountain9 -21.21 22.22`

# New User
`node newUser.js redisPort id name address YYYY-MM-DD gender [lat lon]`

Where
- `redisPort` is a number (> 0) that indicates the port where redis locations is running
- `id` is a string with the new user's id, that cannot exist
- `name` is a string with the name of the new user
- `address` is a string with the address of the new user
- `YYYY-MM-DD` is the date of birth of the new user in that format
- `gender` is a string with the gender of the new user
- `lat` is the latitude where the new user is, `lon` is the longitude where the new user is. If only one or none of them are provided, defaults to ITBA's coordinates

Eg: `node newUser.js 6379 jtallar 'Jota Te' 'Calle Falsa' '1998-02-15' M`

# MongoDB Analytics
`node analytics.js option-name [option-params]`

Where
- `option-name` is an available option
- `option-params` are parameters needed for the option

Available options are the following
* `top [n]` shows the best n users according to their rating. Eg: `node analytics.js top 3`.
* `bottom [n]` shows the worst n users according to their rating. Eg: `node analytics.js bottom 3`.
* `info [id]` shows all available information from the user with that id. Eg: `node analytics.js info jet6`.
* `top-activity [n]` shows the n most rated people, regardless of the score. Eg: `node analytics.js top-activity 3`.
* `avg-activity` shows the average number of ratings made to each person. Eg: `node analytics.js avg-activity`.
* `interactions-per-hour [YYYY-MM-DD]` shows the average interactions made each hour on day \[YYYY-MM-DD\]. Eg: `node analytics.js interactions-per-hour '2020-11-24'`.
* `top-days [n]` shows the n days when people made the most ratings. Eg: `node analytics.js top-days 1`.
* `geo-count-within [lat, lon, radius]` shows the number of ratings made in a spherical radius (in meters) around [lat, lon]. Eg: `node analytics.js geo-count-within 22 -21 1000000`.

Every top/bottom is sorted by id when the number matches.