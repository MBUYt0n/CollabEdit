docker run -it -p 3000:3000 --name collabedit server /usr/bin/fish
docker cp src collabedit:/home/CollabEdit
docer start -ai collabedit
docker rm collabedit