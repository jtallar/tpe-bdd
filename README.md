# TPE Bases de Datos II
## Nosedive, Black Mirror
### MongoDB + Redis

# What to Install
- npm install mongodb
- npm install csv-parser
- npm install fs
- npm install random-words

# Populate MongoDB
`node populate.js file.csv linesToProcess rateCount [DROP]`

Where 
- `file.csv` is a csv file with headers YearOfBirth,Name,Sex,Number 
- `linesToProcess` is a number (> 0) to set maxLines to process
- `rateCount` is a number (>= 0) to set the number of rates to generate between added users
- `[DROP]` indicates if the collection should be dropped before inserting.

Eg: `node populateMongo.js babyNamesUSYOB-full.csv 10 20 DROP`