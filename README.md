# Collapsing Windows

## Shy interface

This project presents an interface with 4 hidden compartments. Each compartment contains a thumbnail, a short read, and a long read. Readers may open up these compartments to descend further into each one.

## Getting started

```sh
# Install dependencies
npm install

# Start webpack-dev-server
npm run start

# Create a build for deployment
npm run build

# Deploy (with github pages)
git subtree push --prefix dist origin gh-pages

```

## Sketchbook boilerplate

This project lives on my [`sketchbook-static`](https://github.com/tylerpaige/sketchbook-static) boilerplate. As I work through different potential directions (i.e. sketches), different routes may become available. Routes are configured to connect with JS endpoints, templates, and data sources. For each route configured, a file will be built in the `dist/` folder, along with all of its assets. 

Discrete sketches should live in their own directory inside `src/sketches/`. You can, however, store as many iterations of the same idea as you want in the same folder (think color schemes, slightly different animations, etc). 

Every sketch will need a template (handlebars) and a js file. The js file can then import the necessary styles. 

Paths to these files should be stored in the `routes.js` array. Webpack reads this configuration to compile all the assets. `name` refers to the projects display name in the automatically generated. `path` refers to the filename at which the sketch should be saved.

If a sketch's template needs to use `img` tags or otherwise link to images, you'll have to create a directory for imgs. Then, add a property `img` using the path to the directory (relative to the project root) as the value. In your template, path to your images as if they are in the same directory. Webpack will automatically copy everything in your specified `img` directory and copy it to the dist folder. All files in the dist folder are in a single layer.

`routes.js`

```js
module.exports = [
  {
    name : 'demo',
    path : 'demo.html',
    js : './src/sketches/demo/js/index.js',
    template : './src/sketches/demo/templates/template.hbs',
    img : './src/sketches/demo/img/'
  }
]
```

`src/sketch/demo/template.hbs`

```hbs
<!-- wrong -->
<img src="../img/logo.png" />

<!-- right -->
<img src="./logo.png" />
```

If a sketch needs a data file for its rendering, list the path to the data file under the value `data`. 

`routes.js`

```js
module.exports = [
  {
    name : 'demo',
    path : 'demo.html',
    js : './src/sketches/demo/js/index.js',
    template : './src/sketches/demo/templates/template.hbs',
    data : './src/sketches/demo/data.json'
  }
]
```

Unfortunately, because of how `html-webpack-plugin` works, the reference to your data is sort of verbose.

```hbs
<h1>{{htmlWebpackPlugin.options.data.heading}}</h1>
```

I have, therefore, included a simple snippet for shortening the reference. Just include this call to the `var` helper at the top of your template.

```hbs
{{var "data" htmlWebpackPlugin.options.data}}

<h1>{{data.heading}}</h1>
```


## TODO

- Visual effect for "will open if you release" 
- Update URL state on navigation? Could be contrary to project's thesis
- Purer state management
- Write full version copy
- `mouseUp` events on full document cause undesired visual feedback
- `touchEnd` events are only working when logged to console? wtf?