const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
const dbpath = path.join(__dirname, 'moviesData.db')
app.use(express.json())

let db = null

const modifiedObj = obj => ({
  movieId: obj.movie_id,
  directorId: obj.director_id,
  movieName: obj.movie_name,
  leadActor: obj.lead_actor,
})

const modifiedArray = list => list.map(obj => modifiedObj(obj))

const modifiedDirectorObj = obj => ({
  directorId: obj.director_id,
  directorName: obj.director_name,
})

const modifiedDirectorList = list => list.map(obj => modifiedDirectorObj(obj))

const initilizeDataBase = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('server start')
    })
  } catch (e) {
    console.log(e.message)
    process.exit(1)
  }
}

// get all movies

app.get('/movies/', async (request, response) => {
  const getMovieQueries = `
          select movie_name as movieName
          from 
          movie 
    `
  const movieList = await db.all(getMovieQueries)
  response.send(movieList)
})

// post: adding new movie to database

app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const addMovieQuries = ` 
      insert into
      movie(director_id, movie_name, lead_actor) 
      values 
      (
       ${directorId}, 
      '${movieName}',
      '${leadActor}'
      )
  `
  await db.run(addMovieQuries)
  response.send('Movie Successfully Added')
})

// get single movie details

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuries = ` 
        select * 
        from 
        movie 
        where 
        movie_id = ${movieId}
  `
  const movieDetail = await db.get(getMovieQuries)
  // console.log(movieDetail)
  response.send(modifiedObj(movieDetail))
})

// update details

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const updateQuries = ` 
    update 
    movie 
    set  
    director_id = ${directorId}, 
    movie_name = '${movieName}', 
    lead_actor =  '${leadActor}'
    where 
    movie_id = ${movieId}
  `
  await db.run(updateQuries)
  response.send('Movie Details Updated')
})

// delete movie
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteQuries = ` 
     delete from movie 
     where 
     movie_id = ${movieId}
  `
  await db.run(deleteQuries)
  response.send('Movie Removed')
})

// get director
app.get('/directors/', async (request, response) => {
  const directorQueries = ` 
      select * 
      from director 
    `
  const directorList = await db.all(directorQueries)
  response.send(modifiedDirectorList(directorList))
})

// get movie name specied by director

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getQuries = `
    select movie_name as movieName 
    from 
    movie 
    where 
    director_id = ${directorId}
  `
  const result = await db.all(getQuries)
  response.send(result)
})

initilizeDataBase()

module.exports = app
