# TPE Bases de Datos II
## Nosedive, Black Mirror
### MongoDB + Redis

# What to Install
- npm install mongodb
- npm install csv-parser
- npm install fs
- npm install random-words

# Populate MongoDB
`node populate.js file.csv linesToProcess [DROP]`

Where file.csv is a csv file with headers YearOfBirth,Name,Sex,Number; linesToProcess
is a number to set maxLines to process; and `[DROP]` indicates if the collection 
should be dropped before inserting.

Eg: `node populate.js babyNamesUSYOB-full.csv 20 DROP`