// light, light-medium, medium, medium-dark, dark, extra-dark
// 'Roasty & Smoky', 'Comforting & Rich', 'Subtle & Delicate', 'Sweet & Tart', 'Sweet & Smooth', 'Balanced & Fruity'
// $13.50, $15.00, $17.35, $22.15, $24.35, $26

const fs = require('fs')

function normalRandom(min, max, skew) {
  let u = 0,
    v = 0
  while (u === 0) u = Math.random() //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random()
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)

  num = num / 10.0 + 0.5 // Translate to 0 -> 1
  if (num > 1 || num < 0) num = randn_bm(min, max, skew) // resample between 0 and 1 if out of range
  num = Math.pow(num, skew) // Skew
  num *= max - min // Stretch to fill range
  num += min // offset to min
  return num
}

let csv = 'price, roast_level, taste\n'

for (let i = 0; i < 500; i++) {
  csv += `${normalRandom(10, 30, 1.5).toFixed(2)}, ${normalRandom(0, 5, 0.5).toFixed(
    2
  )}, ${normalRandom(0, 5, 1).toFixed(2)} \n`
}

fs.writeFileSync('coffees.csv', csv)
