
var batas_harga = 20; // batas harga

// class Pupuk
var Pupuk = function(name, efektifitasPupuk, harga) {
  this.name = name;
  this.efektifitasPupuk = efektifitasPupuk;
  this.harga = harga;
}

// items: name, efektifitas pupuk, harga
var items = [];
items.push(new Pupuk("Urea", 10.00, 4.00));
items.push(new Pupuk("NPK (Nitrogen Phospate Kalium)", 20.00, 5.00));
items.push(new Pupuk("Dolomite (Kapur Karbonat)", 15.00, 8.00));
items.push(new Pupuk("Organik (Kompos)", 15.00, 4.00));
items.push(new Pupuk("ZA (Zwavelzure Amonium)", 30.00, 7.00));
items.push(new Pupuk("SP-36 (Super Phosphate)", 10.00, 5.00));
items.push(new Pupuk("Organik (Kandang)", 30.00, 2.00));

// Gene == Chromosome

// Gene Class
var Gene = function() {
  this.genotype;
  this.fitness;
  this.generation = 0;
}

// konversi tiap phenotype menjadi genotype
Gene.prototype.encode = function(phenotype) {
  this.genotype = Array(phenotype.length).fill(0);
  var totalHarga = 0;
  while (totalHarga < batas_harga) {
    // pick an item at random 
    var index = Math.floor(Math.random() * items.length);
    index = index == items.length ? index - 1 : index;
    totalHarga += items[index].harga;

    if (totalHarga >= batas_harga) {
      break;
    }

    // jika terpilih value di array = 1
    this.genotype[index] = 1;
  }
}

// perhitungan fitness dari gene
Gene.prototype.hitFitness = function() {
  // ambil gen yg terpilih (value == 1 || value)
  function getItem(item, index) {
    return scope.genotype[index] > 0;
  }

  // jumlah dari efektifitas semua gen
  function sumPoints(total, item) {
    return total + item.efektifitasPupuk;
  }

  // jumlah harga dari semua gen
  function sumHarga(total, item) {
    return total + item.harga;
  }

  var scope = this;
  var selectedItems = items.filter(getItem);
  this.fitness = selectedItems.reduce(sumPoints, 0);
  var totalHarga = selectedItems.reduce(sumHarga, 0);

  // jika total harga melebihi batas harga,maka nilai fitness = 0
  if (totalHarga > batas_harga) {
    this.fitness = 0;
  }
}

// perhitungan untuk gene bernilai = 1
Gene.prototype.makeMax = function(phenotype) {
  this.genotype = Array(phenotype.length).fill(1);
  this.fitness = 0;

  for(var i = 0; i < phenotype.length; i++){
    this.fitness += phenotype[i].efektifitasPupuk;
  }
}

// Cross-over operator: one point cross-over (penyilangan antara gene)
Gene.prototype.oneCrossOver = function(crossOverPr, anotherGene) {
  var prob = Math.random();

  if (prob >= crossOverPr) {

    var crossOver = Math.floor(Math.random() * this.genotype.length);
    crossOver = crossOver == this.genotype.length ? crossOver - 1 : crossOver;
    // Gene 1
    var head1 = this.genotype.slice(0, crossOver);
    var head2 = anotherGene.genotype.slice(0, crossOver);
    // Gene 2
    var tail1 = this.genotype.slice(crossOver);
    var tail2 = anotherGene.genotype.slice(crossOver);

    // dibuat off-spring dari penyilangan yang dibuat
    var offSpring1 = new Gene();
    var offSpring2 = new Gene();
    offSpring1.genotype = head1.concat(tail2);
    offSpring2.genotype = head2.concat(tail1);

    return [offSpring1, offSpring2];
  }

  return [this, anotherGene];
}

// Mutation
Gene.prototype.mutate = function(mutationPr) {
  for (var i = 0; i < this.genotype.length; i++) {
    // mutasi berdasarkan perbandingan secara acak
    if (mutationPr >= Math.random()) {
      this.genotype[i] = 1 - this.genotype[i];
    }
  }
}

// digunakan untuk pengurutan array
function compareFitness(gene1, gene2) {
  return gene2.fitness - gene1.fitness;
}

// class Population yang terdiri dari Gene / Chromosome
var Population = function(size) {
  this.genes = [];
  this.generation = 0;
  this.solution = 0;
  // create and encode the genes
  while (size--) {
    var gene = new Gene();
    gene.encode(items);
    this.genes.push(gene);
  }
}

// perhitungan fitness
Population.prototype.initialize = function() {
  for (var i = 0; i < this.genes.length; i++) {
    this.genes[i].hitFitness();
  }
}

// operator select : pengurutan fitness dan pengambilan gen 2 pertama
Population.prototype.select = function() {
  this.genes.sort(compareFitness);
  return [this.genes[0], this.genes[1]];
}

// parameter genetic algorithm (cross over, mutation, selection)
// Cross-over prob:
var crossOverPr = 0.9;
// Mutation prob:
var mutationPr = 0.3;

// hitung gen dari populasi sekarang
Population.prototype.generate = function() {
  // select the parents
  parents = this.select();

  // cross-over
  var offSpring = parents[0].oneCrossOver(crossOverPr, parents[1]);
  this.generation++;

  // re-place in population
  this.genes.splice(this.genes.length - 2, 2, offSpring[0], offSpring[1]);
  // memasukkan nomor generasi ke offSpring
  offSpring[0].generation = offSpring[1].generation = this.generation;

  // mutate the population
  for (var i = 0; i < this.genes.length; i++) {
    this.genes[i].mutate(mutationPr);
  }

  // perhitungan fitness kembali setelah cross-over dan mutasi
  this.initialize();
  this.genes.sort(compareFitness);
  this.solution = population.genes[0].fitness; // pick the solution;

  display();

  // perulangan berhenti setelah n generation
  if (this.generation >= 100) {
    return true;
  }

  // lakukan perhitungan kembali setelah delay selama 200ms
  var scope = this;
  setTimeout(function() {
    scope.generate();
  }, 200);
}

// Frontend
window.onload = init;
var canvas;
var context;

var population = new Population(100);
var maxSurvivalPoints = 0;

function init(){
  // gen dengan nilai fitness tertinggi
  var maxGene = new Gene();
  maxGene.makeMax(items);
  maxSurvivalPoints = maxGene.fitness;

  canvas = document.getElementById('populationCanvas');
  context = canvas.getContext('2d'); // CanvasRenderingContext2D

  population.initialize(); 
  population.generate();
}

// Frontend
function display(){
  var fitness = document.getElementById('fitness');

  fitness.innerHTML = 'Efektifitas Pupuk: ' + population.genes[0].fitness;
  fitness.innerHTML += '<br/>Gen Type (Pupuk): ' + population.genes[0].genotype;

  context.clearRect(0, 0, canvas.width, canvas.height);
  var index = 0;
  var radius = 30;
  // Genes
  for(var i = 0; i < 10; i++){
    var centerY = radius + (i + 1) * 5 + i * 2 * radius; //Y
    for(var j = 0; j < 10; j++){
      var centerX = radius + (j + 1) * 5 + j * 2 * radius; //X
      context.beginPath();
      context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
      // pick the fitness for opacity calculation;
      var opacity = population.genes[index].fitness / maxSurvivalPoints;
      context.fillStyle = 'rgba(0,0,155, ' + opacity + ')';
      context.fill();
      context.stroke();
      context.fillStyle = 'black';
      context.textAlign = 'center';
      context.font = 'bold 12pt Calibri';
      // print the generation number
      context.fillText(population.genes[index].generation, centerX, centerY);
      index++;
    }
  }
}
