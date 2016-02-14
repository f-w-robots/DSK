# DSK
Game board

### Setup
  - install docker & docker-compose (docker-toolbox for windows/osx)
  - git clone git@github.com:f-w-robots/DSK.git
  - git clone git@github.com:f-w-robots/MZG.git
  - cd MZG
  - docker-compose up -d
  - cd DSK
  - docker-compose up -d
  - go to http://localhost:4200/
  - create new device with ID "turtle1", Manual checkbox checked and Interface ID "turtle"
  - create new interface with ID "turtle" and body from DSK/mzg-db/turtle-control.html
  - go to http://localhost:5600/
  - open in new tab http://localhost:4200/ and select turtle1 in Manual control list
  - You must create list of commands and press start
