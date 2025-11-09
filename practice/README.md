- Serving static files in Express

```js
app.use(express.static('public'))

// http://localhost:3000/images/kitten.jpg
// http://localhost:3000/css/style.css
// http://localhost:3000/js/app.js
// http://localhost:3000/images/bg.png
// http://localhost:3000/hello.html


```

- serving multiple static files

```js
app.use(express.static('public'))
app.use(express.static('files'))

```

- to create a virtual path as prefix add

```js
app.use("/static", express.static("public"))

// every api should be prefixed with static thing now
```


- dynamic routes


```js
app.get('/users/:userId/books/:bookId', (req, res) => {
  res.send(req.params)
})

```