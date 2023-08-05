<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Run in development

1. Clone the repository
2. Run
```
yarn install
```
3. Have Nest CLI installed
```
npm i -g @nestjs/cli
```

4. Lift the database
```
docker compose up -d
```

5. Rebuild the database with seed
```
http://localhost:3000/api/v2/seed
```


## Stack used
* MongoDB
* Nest
