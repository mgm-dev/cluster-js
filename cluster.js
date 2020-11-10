const stats = require('simple-statistics')
const dataForge = require('data-forge-fs')
const { KMeans } = require('shaman')
const plotly = require('plotly')('mgm-dev', '8VpURftT6PPgqVhwaQT5')
const opn = require('open')

const INDEXES = {
  price: 0,
  roast_level: 1,
  taste: 2,
}
const X_AXIS = 'price'
const Y_AXIS = 'roast_level'
const Z_AXIS = 'taste'

const df = dataForge.readFileSync('coffees.csv').parseCSV()

const subset = df.subset([X_AXIS, Y_AXIS, Z_AXIS]).select(function (row) {
  return {
    price: parseFloat(row.price),
    roast_level: parseFloat(row.roast_level),
    taste: parseFloat(row.taste),
  }
})

console.log(subset)

/**
 * Summary function return the overview about the data serie
 * @param data array
 */
function summary(column) {
  return {
    min: stats.min(column),
    max: stats.max(column),
    sum: stats.sum(column),
    median: stats.median(column),
    mode: stats.mode(column),
    mean: stats.mean(column),
    variance: stats.variance(column),
    stdDeviation: stats.standardDeviation(column),
    quantile: {
      q1: stats.quantile(column, 0.25),
      q3: stats.quantile(column, 0.75),
    },
  }
}

// invoke and show summary
console.log(X_AXIS)
console.log(summary(subset.getSeries(X_AXIS).toArray()))
console.log(Y_AXIS)
console.log(summary(subset.getSeries(Y_AXIS).toArray()))
console.log(Z_AXIS)
console.log(summary(subset.getSeries(Z_AXIS).toArray()))

const kmeans = new KMeans(8)

kmeans.cluster(subset.toRows(), function (err, clusters, centroids) {
  console.error(err || 'no err')
  console.log(clusters)
  console.log(centroids)

  // build centroids graph model
  const centroidTrace = {
    x: centroids.map(function (c) {
      return c[INDEXES[X_AXIS]]
    }),
    y: centroids.map(function (c) {
      return c[INDEXES[Y_AXIS]]
    }),
    z: centroids.map(function (c) {
      return c[INDEXES[Z_AXIS]]
    }),
    mode: 'markers',
    type: 'scatter3d',
    name: 'Centroids',
    marker: {
      color: '#000000',
      symbol: 'cross',
      size: 20,
    },
  }

  // adding centroids data on the plotData array
  const plotData = [centroidTrace]
  // build clusters graph model
  clusters.forEach(function (cluster, index) {
    const trace = {
      x: cluster.map(function (c) {
        return c[INDEXES[X_AXIS]]
      }),
      y: cluster.map(function (c) {
        return c[INDEXES[Y_AXIS]]
      }),
      z: cluster.map(function (c) {
        return c[INDEXES[Z_AXIS]]
      }),
      jitter: 0.3,
      mode: 'markers',
      type: 'scatter3d',
      name: 'Cluster ' + index,
    }
    // add cluster graph data on plotData
    plotData.push(trace)
  })

  // set plotly graph layout
  const layout = {
    title: 'Coffee Clustering',
    xaxis: {
      title: X_AXIS,
    },
    yaxis: {
      title: Y_AXIS,
    },
    zaxis: {
      title: Z_AXIS,
    },
  }

  //set graph options
  const graphOptions = {
    layout: layout, //set layout
    filename: 'coffee-clustering', //set filename
    fileopt: 'overwrite', // if exists just overwrite
  }

  /**
   * Build Plotly graph
   */
  plotly.plot(plotData, graphOptions, function (err, msg) {
    if (!err) {
      // if build without erros show the message and open browser with graph
      console.log(`Success! The plot ${msg.filename} can be found at ${msg.url}`)
      opn(msg.url)
      process.exit()
    }
  })
})
